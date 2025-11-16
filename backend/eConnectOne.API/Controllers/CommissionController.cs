using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using eConnectOne.API.Services;
using eConnectOne.API.Models;
using System.Security.Claims;

namespace eConnectOne.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CommissionController : ControllerBase
    {
        private readonly ICommissionService _commissionService;

        public CommissionController(ICommissionService commissionService)
        {
            _commissionService = commissionService;
        }

        [HttpGet]
        public async Task<ActionResult> GetCommissions([FromQuery] int? year = null)
        {
            var userRole = User.FindFirst("role")?.Value;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            int? cspUserId = null;
            
            // CSP users can only see their own commissions
            if (userRole == "CSP")
            {
                cspUserId = userId;
            }

            var commissions = await _commissionService.GetCommissionsAsync(cspUserId, year);
            return Ok(commissions);
        }

        [HttpGet("{commissionId}")]
        public async Task<ActionResult> GetCommission(string commissionId)
        {
            if (!Guid.TryParse(commissionId, out var id))
                return BadRequest("Invalid commission ID");

            var userRole = User.FindFirst("role")?.Value;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            int? cspUserId = null;
            
            // CSP users can only see their own commissions
            if (userRole == "CSP")
            {
                cspUserId = userId;
            }

            var commission = await _commissionService.GetCommissionAsync(id, cspUserId);
            
            if (commission == null)
                return NotFound();

            return Ok(commission);
        }

        [HttpPost]
        [Authorize(Roles = "Master Admin,Admin")]
        public async Task<ActionResult> CreateCommission([FromBody] CreateCommissionRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var commission = new Commission
            {
                CSPUserId = request.CSPUserId,
                Month = request.Month,
                Year = request.Year,
                BaseCommission = request.BaseCommission,
                BonusCommission = request.BonusCommission,
                Deductions = request.Deductions,
                TaxDeducted = request.TaxDeducted,
                Description = request.Description,
                CreatedByUserId = userId
            };

            var breakdowns = request.Breakdowns?.Select(b => new CommissionBreakdown
            {
                ServiceType = b.ServiceType,
                TransactionCount = b.TransactionCount,
                TransactionVolume = b.TransactionVolume,
                CommissionRate = b.CommissionRate,
                CommissionAmount = b.CommissionAmount,
                Notes = b.Notes
            }).ToList() ?? new List<CommissionBreakdown>();

            try
            {
                var createdCommission = await _commissionService.CreateCommissionAsync(commission, breakdowns);
                return CreatedAtAction(nameof(GetCommission), new { commissionId = createdCommission.CommissionId }, createdCommission);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to create commission", error = ex.Message });
            }
        }

        [HttpPut("{commissionId}")]
        [Authorize(Roles = "Master Admin")]
        public async Task<ActionResult> UpdateCommission(string commissionId, [FromBody] UpdateCommissionRequest request)
        {
            if (!Guid.TryParse(commissionId, out var id))
                return BadRequest("Invalid commission ID");

            var commission = await _commissionService.GetCommissionAsync(id, null);
            if (commission == null)
                return NotFound();

            commission.Month = request.Month;
            commission.Year = request.Year;
            commission.BaseCommission = request.BaseCommission;
            commission.BonusCommission = request.BonusCommission;
            commission.Deductions = request.Deductions;
            commission.TaxDeducted = request.TaxDeducted;
            commission.Description = request.Description;
            commission.TotalCommission = commission.BaseCommission + commission.BonusCommission - commission.Deductions;
            commission.NetPayable = commission.TotalCommission - commission.TaxDeducted;

            await _commissionService.UpdateCommissionAsync(commission);
            return Ok(commission);
        }

        [HttpDelete("{commissionId}")]
        [Authorize(Roles = "Master Admin")]
        public async Task<ActionResult> DeleteCommission(string commissionId)
        {
            if (!Guid.TryParse(commissionId, out var id))
                return BadRequest("Invalid commission ID");

            var result = await _commissionService.DeleteCommissionAsync(id);
            if (!result)
                return NotFound();

            return Ok(new { message = "Commission deleted successfully" });
        }

        [HttpPut("{commissionId}/status")]
        [Authorize(Roles = "Master Admin,Admin")]
        public async Task<ActionResult> UpdateCommissionStatus(string commissionId, [FromBody] UpdateStatusRequest request)
        {
            if (!Guid.TryParse(commissionId, out var id))
                return BadRequest("Invalid commission ID");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var commission = await _commissionService.UpdateCommissionStatusAsync(id, request.Status, userId, request.Remarks);
            
            if (commission == null)
                return NotFound();

            return Ok(commission);
        }

        [HttpGet("years")]
        public async Task<ActionResult> GetAvailableYears()
        {
            var userRole = User.FindFirst("role")?.Value;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            int? cspUserId = null;
            if (userRole == "CSP")
            {
                cspUserId = userId;
            }

            var commissions = await _commissionService.GetCommissionsAsync(cspUserId);
            var years = commissions.Select(c => c.Year).Distinct().OrderByDescending(y => y).ToList();
            
            return Ok(years);
        }
    }

    public class CreateCommissionRequest
    {
        public int CSPUserId { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal BaseCommission { get; set; }
        public decimal BonusCommission { get; set; }
        public decimal Deductions { get; set; }
        public decimal TaxDeducted { get; set; }
        public string? Description { get; set; }
        public List<CommissionBreakdownRequest>? Breakdowns { get; set; }
    }

    public class CommissionBreakdownRequest
    {
        public required string ServiceType { get; set; }
        public int TransactionCount { get; set; }
        public decimal TransactionVolume { get; set; }
        public decimal CommissionRate { get; set; }
        public decimal CommissionAmount { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateCommissionRequest
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal BaseCommission { get; set; }
        public decimal BonusCommission { get; set; }
        public decimal Deductions { get; set; }
        public decimal TaxDeducted { get; set; }
        public string? Description { get; set; }
    }

    public class UpdateStatusRequest
    {
        public required string Status { get; set; }
        public string? Remarks { get; set; }
    }
}