using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using eConnectOne.API.Data;
using eConnectOne.API.Models;
using eConnectOne.API.Services;
using System.Security.Claims;

namespace eConnectOne.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WalletController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWalletService _walletService;
        private readonly IFraudDetectionService _fraudDetectionService;
        private readonly ILimitValidationService _limitValidationService;

        public WalletController(
            ApplicationDbContext context, 
            IWalletService walletService,
            IFraudDetectionService fraudDetectionService,
            ILimitValidationService limitValidationService)
        {
            _context = context;
            _walletService = walletService;
            _fraudDetectionService = fraudDetectionService;
            _limitValidationService = limitValidationService;
        }

        [HttpGet]
        public async Task<ActionResult<Wallet>> GetWallet()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            try
            {
                var wallet = await _walletService.EnsureWalletExistsAsync(userId);
                await _context.Entry(wallet).Reference(w => w.User).LoadAsync();
                return Ok(wallet);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to retrieve wallet", error = ex.Message });
            }
        }

        [HttpGet("transactions")]
        public async Task<ActionResult<object>> GetTransactions(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 20,
            [FromQuery] string? type = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var wallet = await _context.Wallets
                .AsNoTracking()
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null)
                return NotFound("Wallet not found");

            var query = _context.WalletTransactions
                .AsNoTracking()
                .Where(t => t.WalletId == wallet.WalletId);

            // Apply filters
            if (!string.IsNullOrEmpty(type))
                query = query.Where(t => t.TransactionType == type);
            if (fromDate.HasValue)
                query = query.Where(t => t.CreatedDate >= fromDate.Value);
            if (toDate.HasValue)
                query = query.Where(t => t.CreatedDate <= toDate.Value);

            var totalCount = await query.CountAsync();
            var transactions = await query
                .OrderByDescending(t => t.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new {
                    t.TransactionId,
                    t.TransactionType,
                    t.Amount,
                    t.BalanceAfter,
                    t.Description,
                    t.Status,
                    t.CreatedDate
                })
                .ToListAsync();

            return Ok(new {
                transactions,
                totalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        [HttpPost("adjust")]
        [Authorize(Roles = "Master Admin,Admin")]
        public async Task<ActionResult> AdjustBalance(
            [FromBody] AdjustBalanceRequest request)
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(adminIdClaim, out int adminId))
                return Unauthorized();

            var wallet = await _walletService.EnsureWalletExistsAsync(request.UserId);

            var oldBalance = wallet.Balance;
            wallet.Balance += request.Amount;
            wallet.UpdatedDate = DateTime.UtcNow;

            var transaction = new WalletTransaction
            {
                WalletId = wallet.WalletId,
                TransactionType = "ADJUSTMENT",
                Amount = request.Amount,
                BalanceAfter = wallet.Balance,
                Description = request.Description,
                Status = "COMPLETED",
                CreatedByUserId = adminId
            };

            _context.WalletTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Balance adjusted successfully",
                oldBalance,
                newBalance = wallet.Balance,
                adjustment = request.Amount
            });
        }

        [HttpGet("user/{userId}")]
        [Authorize(Roles = "Master Admin,Admin,HO User")]
        public async Task<ActionResult<Wallet>> GetUserWallet(int userId)
        {
            var wallet = await _context.Wallets
                .Include(w => w.User)
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null)
                return NotFound("Wallet not found");

            return Ok(wallet);
        }

        [HttpPost("process-withdrawal")]
        [Authorize(Roles = "Master Admin,Admin,HO User")]
        public async Task<ActionResult> ProcessWithdrawal(
            [FromBody] ProcessApprovalRequest request)
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(adminIdClaim, out int adminId))
                return Unauthorized();

            // Validate limits
            var limitValidation = await _limitValidationService.ValidateTransactionAsync(
                request.UserId, request.ApprovedAmount, "WITHDRAWAL");

            if (!limitValidation.IsValid)
            {
                return BadRequest(new { 
                    message = "Transaction violates limits", 
                    violations = limitValidation.Violations 
                });
            }

            // Get risk assessment
            var riskAssessment = await _fraudDetectionService.AssessTransactionRiskAsync(
                Guid.Parse(request.TicketId));

            var wallet = await _walletService.EnsureWalletExistsAsync(request.UserId);
            var balanceBefore = wallet.Balance;

            // Update withdrawal detail with approval info
            var withdrawalDetail = await _context.WithdrawalDetails
                .FirstOrDefaultAsync(w => w.TicketId == Guid.Parse(request.TicketId));
            
            if (withdrawalDetail != null)
            {
                withdrawalDetail.ApprovedAmount = request.ApprovedAmount;
                withdrawalDetail.ApprovedByUserId = adminId;
                withdrawalDetail.ApprovedDate = DateTime.UtcNow;
                withdrawalDetail.ApprovalComment = request.Comment;
            }

            wallet.Balance -= request.ApprovedAmount;
            wallet.UpdatedDate = DateTime.UtcNow;

            var transaction = new WalletTransaction
            {
                WalletId = wallet.WalletId,
                TicketId = Guid.Parse(request.TicketId),
                TransactionType = "WITHDRAWAL",
                Amount = -request.ApprovedAmount,
                BalanceAfter = wallet.Balance,
                Description = $"Withdrawal approved: ₹{request.ApprovedAmount:N2} (Requested: ₹{request.RequestedAmount:N2}). {request.Comment}",
                Status = "COMPLETED",
                CreatedByUserId = adminId
            };

            _context.WalletTransactions.Add(transaction);

            // Create audit trail
            var audit = new TransactionAudit
            {
                TicketId = Guid.Parse(request.TicketId),
                WalletTransactionId = transaction.TransactionId,
                Action = "WITHDRAWAL_APPROVED",
                OldAmount = request.RequestedAmount,
                NewAmount = request.ApprovedAmount,
                BalanceBefore = balanceBefore,
                BalanceAfter = wallet.Balance,
                PerformedByUserId = adminId,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = HttpContext.Request.Headers.UserAgent.ToString(),
                Reason = request.Comment,
                RiskLevel = riskAssessment.RiskLevel
            };

            _context.TransactionAudits.Add(audit);
            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Withdrawal processed", 
                requestedAmount = request.RequestedAmount,
                approvedAmount = request.ApprovedAmount,
                newBalance = wallet.Balance,
                isNegative = wallet.Balance < 0
            });
        }

        [HttpPost("process-deposit")]
        [Authorize(Roles = "Master Admin,Admin,HO User")]
        public async Task<ActionResult> ProcessDeposit(
            [FromBody] ProcessApprovalRequest request)
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(adminIdClaim, out int adminId))
                return Unauthorized();

            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.UserId == request.UserId);

            if (wallet == null)
            {
                wallet = new Wallet { UserId = request.UserId };
                _context.Wallets.Add(wallet);
                await _context.SaveChangesAsync();
            }

            // Update deposit detail with approval info
            var depositDetail = await _context.DepositDetails
                .FirstOrDefaultAsync(d => d.TicketId == Guid.Parse(request.TicketId));
            
            if (depositDetail != null)
            {
                depositDetail.ApprovedAmount = request.ApprovedAmount;
                depositDetail.ApprovedByUserId = adminId;
                depositDetail.ApprovedDate = DateTime.UtcNow;
                depositDetail.ApprovalComment = request.Comment;
            }

            wallet.Balance += request.ApprovedAmount;
            wallet.UpdatedDate = DateTime.UtcNow;

            var transaction = new WalletTransaction
            {
                WalletId = wallet.WalletId,
                TicketId = Guid.Parse(request.TicketId),
                TransactionType = "DEPOSIT",
                Amount = request.ApprovedAmount,
                BalanceAfter = wallet.Balance,
                Description = $"Deposit approved: ₹{request.ApprovedAmount:N2} (Requested: ₹{request.RequestedAmount:N2}). {request.Comment}",
                Status = "COMPLETED",
                CreatedByUserId = adminId
            };

            _context.WalletTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Deposit processed", 
                requestedAmount = request.RequestedAmount,
                approvedAmount = request.ApprovedAmount,
                newBalance = wallet.Balance
            });
        }

        [HttpPost("bulk-approve")]
        [Authorize(Roles = "Master Admin,Admin,HO User")]
        public async Task<ActionResult> BulkApprove(
            [FromBody] BulkApprovalRequest request)
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(adminIdClaim, out int adminId))
                return Unauthorized();

            var results = new List<object>();

            foreach (var ticketId in request.TicketIds)
            {
                try
                {
                    var ticket = await _context.Tickets
                        .Include(t => t.WithdrawalDetail)
                        .Include(t => t.DepositDetail)
                        .FirstOrDefaultAsync(t => t.TicketId == Guid.Parse(ticketId));

                    if (ticket == null) continue;

                    var requestedAmount = ticket.WithdrawalDetail?.Amount ?? ticket.DepositDetail?.Amount ?? 0;
                    var approvedAmount = request.ApprovalType switch
                    {
                        "percentage" => requestedAmount * (request.Value / 100),
                        "fixed" => request.Value,
                        _ => requestedAmount
                    };

                    var wallet = await _walletService.EnsureWalletExistsAsync(ticket.RaisedByUserId);

                    if (ticket.TypeId == 2) // Withdrawal
                    {
                        wallet.Balance -= approvedAmount;
                        if (ticket.WithdrawalDetail != null)
                        {
                            ticket.WithdrawalDetail.ApprovedAmount = approvedAmount;
                            ticket.WithdrawalDetail.ApprovedByUserId = adminId;
                            ticket.WithdrawalDetail.ApprovedDate = DateTime.UtcNow;
                            ticket.WithdrawalDetail.ApprovalComment = request.Comment;
                        }
                    }
                    else // Deposit
                    {
                        wallet.Balance += approvedAmount;
                        if (ticket.DepositDetail != null)
                        {
                            ticket.DepositDetail.ApprovedAmount = approvedAmount;
                            ticket.DepositDetail.ApprovedByUserId = adminId;
                            ticket.DepositDetail.ApprovedDate = DateTime.UtcNow;
                            ticket.DepositDetail.ApprovalComment = request.Comment;
                        }
                    }

                    var transaction = new WalletTransaction
                    {
                        WalletId = wallet.WalletId,
                        TicketId = ticket.TicketId,
                        TransactionType = ticket.TypeId == 2 ? "WITHDRAWAL" : "DEPOSIT",
                        Amount = ticket.TypeId == 2 ? -approvedAmount : approvedAmount,
                        BalanceAfter = wallet.Balance,
                        Description = $"Bulk {(ticket.TypeId == 2 ? "withdrawal" : "deposit")}: ₹{approvedAmount:N2}",
                        Status = "COMPLETED",
                        CreatedByUserId = adminId
                    };

                    _context.WalletTransactions.Add(transaction);
                    ticket.StatusId = 3; // Completed

                    results.Add(new { ticketId, success = true, newBalance = wallet.Balance });
                }
                catch (Exception ex)
                {
                    results.Add(new { ticketId, success = false, error = ex.Message });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Processed {results.Count} tickets", results });
        }
    }

    public class AdjustBalanceRequest
    {
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
    }

    public class ProcessApprovalRequest
    {
        public required string TicketId { get; set; }
        public int UserId { get; set; }
        public decimal RequestedAmount { get; set; }
        public decimal ApprovedAmount { get; set; }
        public string? Comment { get; set; }
    }

    public class BulkApprovalRequest
    {
        public required string[] TicketIds { get; set; }
        public required string ApprovalType { get; set; } // "full", "percentage", "fixed"
        public decimal Value { get; set; }
        public string? Comment { get; set; }
    }
}