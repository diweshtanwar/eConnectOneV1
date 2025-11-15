using eConnectOne.API.Data;
using eConnectOne.API.DTOs.Tickets;
using eConnectOne.API.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace eConnectOne.API.Services.Tickets
{
    public class TicketService : ITicketService
    {
        private readonly ApplicationDbContext _context;

        public TicketService(ApplicationDbContext context)
        {
            _context = context;
        }

        private IQueryable<Ticket> GetTicketsQuery()
        {
            return _context.Tickets
                .AsSplitQuery() // Prevents Cartesian product
                .Include(t => t.TicketType)
                .Include(t => t.TicketStatus)
                .Include(t => t.RaisedByUser)
                .Include(t => t.CreatedByUser)
                .Include(t => t.UpdatedByUser)
                .Include(t => t.TechnicalDetail)
                .Include(t => t.WithdrawalDetail)
                .Include(t => t.DepositDetail)
                .Include(t => t.Attachments)
                    .ThenInclude(a => a.UploadedByUser)
                .Include(t => t.TicketHistory)
                    .ThenInclude(th => th.ChangedByUser)
                .Where(t => !t.IsDeleted);
        }

        private TicketDto MapTicketToDto(Ticket ticket)
        {
            return new TicketDto
            {
                TicketId = ticket.TicketId,
                TypeId = ticket.TypeId,
                TypeName = ticket.TicketType?.TypeName,
                RaisedByUserId = ticket.RaisedByUserId,
                RaisedByUsername = ticket.RaisedByUser?.Username,
                RequesterEmail = ticket.RequesterEmail,
                RequesterMobile = ticket.RequesterMobile,
                Summary = ticket.Summary,
                Description = ticket.Description,
                StatusId = ticket.StatusId,
                StatusName = ticket.TicketStatus?.StatusName,
                RequestedDate = ticket.RequestedDate,
                CompletionDate = ticket.CompletionDate,
                ResolutionDetail = ticket.ResolutionDetail,
                Comment = ticket.Comment,
                CreatedDate = ticket.CreatedDate,
                CreatedByUsername = ticket.CreatedByUser?.Username,
                UpdatedDate = ticket.UpdatedDate,
                UpdatedByUsername = ticket.UpdatedByUser?.Username,
                IsDeleted = ticket.IsDeleted,
                TechnicalDetail = ticket.TechnicalDetail != null ? new TechnicalDetailDto
                {
                    ProblemTypeId = ticket.TechnicalDetail.ProblemTypeId,
                    ProblemTypeName = ticket.TechnicalDetail.ProblemType?.ProblemTypeName,
                    ResolutionProvidedByUserId = ticket.TechnicalDetail.ResolutionProvidedByUserId,
                    ResolutionProvidedByUsername = ticket.TechnicalDetail.ResolutionProvidedByUser?.Username,
                    AnyDeskDetail = ticket.TechnicalDetail.AnyDeskDetail
                } : null,
                WithdrawalDetail = ticket.WithdrawalDetail != null ? new WithdrawalDetailDto
                {
                    Amount = ticket.WithdrawalDetail.Amount,
                    Account = ticket.WithdrawalDetail.Account,
                    IsConfigured = ticket.WithdrawalDetail.IsConfigured,
                    IsMake = ticket.WithdrawalDetail.IsMake,
                    IsAuthorized = ticket.WithdrawalDetail.IsAuthorized,
                    AuthorizedAmount = ticket.WithdrawalDetail.AuthorizedAmount
                } : null,
                DepositDetail = ticket.DepositDetail != null ? new DepositDetailDto
                {
                    Amount = ticket.DepositDetail.Amount,
                    DepositDate = ticket.DepositDetail.DepositDate,
                    HasReceipt = ticket.DepositDetail.HasReceipt,
                    ReceiptSource = ticket.DepositDetail.ReceiptSource,
                    IsVerified = ticket.DepositDetail.IsVerified
                } : null,
                Attachments = ticket.Attachments?.Select(a => new AttachmentDto
                {
                    AttachmentId = a.AttachmentId,
                    FileName = a.FileName,
                    FilePath = a.FilePath,
                    FileType = a.FileType,
                    UploadedByUserId = a.UploadedByUserId,
                    UploadedByUsername = a.UploadedByUser?.Username,
                    UploadedDate = a.UploadedDate
                }).ToList(),
                TicketHistory = ticket.TicketHistory?.Select(th => new TicketHistoryDto
                {
                    HistoryId = th.HistoryId,
                    ChangeType = th.ChangeType,
                    OldValue = th.OldValue,
                    NewValue = th.NewValue,
                    ChangedByUserId = th.ChangedByUserId,
                    ChangedByUsername = th.ChangedByUser?.Username,
                    ChangedDate = th.ChangedDate
                }).ToList()
            };
        }

        public async Task<IEnumerable<TicketDto>> GetAllTicketsAsync(int? userId = null, string? userRole = null)
        {
            var query = GetTicketsQuery();
            
            // Row-level security: CSP users can only see their own tickets
            if (userRole == "CSP" && userId.HasValue)
            {
                query = query.Where(t => t.RaisedByUserId == userId.Value || t.CreatedByUserId == userId.Value);
            }
            
            var tickets = await query.ToListAsync();
            return tickets.Select(MapTicketToDto);
        }

        public async Task<IEnumerable<TicketDto>> GetTicketsByTypeAsync(int typeId, bool includeClosed = false)
        {
            var query = GetTicketsQuery().Where(t => t.TypeId == typeId);
            
            if (!includeClosed)
            {
                query = query.Where(t => t.StatusId != 3 && t.StatusId != 4); // Exclude Resolved and Rejected
            }
            
            var tickets = await query.ToListAsync();
            return tickets.Select(MapTicketToDto);
        }

        public async Task<TicketDto?> GetTicketByIdAsync(Guid ticketId)
        {
            var ticket = await GetTicketsQuery().FirstOrDefaultAsync(t => t.TicketId == ticketId);
            return ticket != null ? MapTicketToDto(ticket) : null;
        }

        public async Task<TicketDto> CreateTicketAsync(TicketCreateDto ticketCreateDto, int createdByUserId)
        {
            var ticket = new Ticket
            {
                TypeId = ticketCreateDto.TypeId,
                RaisedByUserId = ticketCreateDto.RaisedByUserId ?? createdByUserId, // Use provided or authenticated user
                RequesterEmail = ticketCreateDto.RequesterEmail,
                RequesterMobile = ticketCreateDto.RequesterMobile,
                Summary = ticketCreateDto.Summary,
                Description = ticketCreateDto.Description,
                StatusId = ticketCreateDto.StatusId,
                CreatedByUserId = createdByUserId,
                CreatedDate = DateTime.UtcNow,
                RequestedDate = DateTime.UtcNow // Set requested date on creation
            };

            _context.Tickets.Add(ticket);

            // Add specific details based on TypeId
            switch (ticketCreateDto.TypeId)
            {
                case 1: // Technical
                    if (ticketCreateDto.TechnicalDetail != null)
                    {
                        var techDetail = new TechnicalDetail
                        {
                            TicketId = ticket.TicketId,
                            ProblemTypeId = ticketCreateDto.TechnicalDetail.ProblemTypeId,
                            AnyDeskDetail = ticketCreateDto.TechnicalDetail.AnyDeskDetail
                        };
                        _context.TechnicalDetails.Add(techDetail);
                    }
                    break;
                case 2: // Withdrawal
                    if (ticketCreateDto.WithdrawalDetail != null)
                    {
                        var withdrawalDetail = new WithdrawalDetail
                        {
                            TicketId = ticket.TicketId,
                            Amount = ticketCreateDto.WithdrawalDetail.Amount,
                            Account = ticketCreateDto.WithdrawalDetail.Account
                        };
                        _context.WithdrawalDetails.Add(withdrawalDetail);
                    }
                    break;
                case 3: // Deposit
                    if (ticketCreateDto.DepositDetail != null)
                    {
                        var depositDetail = new DepositDetail
                        {
                            TicketId = ticket.TicketId,
                            Amount = ticketCreateDto.DepositDetail.Amount,
                            DepositDate = ticketCreateDto.DepositDetail.DepositDate?.ToUniversalTime() ?? DateTime.UtcNow
                        };
                        _context.DepositDetails.Add(depositDetail);
                    }
                    break;
            }

            await _context.SaveChangesAsync();

            // --- Notification logic: Broadcast to Admin, Master Admin, HO User ---
            var broadcast = new Broadcast
            {
                Title = "New Ticket Created",
                Message = $"A new ticket (#{ticket.TicketId}) has been created: {ticket.Summary}",
                Priority = "Normal",
                SentByUserId = createdByUserId,
                TargetRoles = "Admin,Master Admin,HO User",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            _context.Broadcasts.Add(broadcast);
            await _context.SaveChangesAsync();

            var targetUsers = await _context.Users
                .Include(u => u.Role)
                .Where(u => !u.IsDeleted && u.IsActive &&
                    u.Role != null &&
                    (u.Role.Name == "Admin" || u.Role.Name == "Master Admin" || u.Role.Name == "HO User"))
                .ToListAsync();

            var receipts = targetUsers.Select(user => new BroadcastReceipt
            {
                BroadcastId = broadcast.Id,
                UserId = user.Id
            }).ToList();

            _context.BroadcastReceipts.AddRange(receipts);
            await _context.SaveChangesAsync();
            // --- End notification logic ---

            // Fetch the created ticket with all includes for DTO mapping
            var createdTicket = await GetTicketsQuery().FirstOrDefaultAsync(t => t.TicketId == ticket.TicketId);
            return MapTicketToDto(createdTicket!); // createdTicket should not be null here
        }

        public async Task<TicketDto?> UpdateTicketAsync(Guid ticketId, TicketUpdateDto ticketUpdateDto, int updatedByUserId)
        {
            var ticket = await _context.Tickets
                .Include(t => t.TechnicalDetail)
                .Include(t => t.WithdrawalDetail)
                .Include(t => t.DepositDetail)
                .FirstOrDefaultAsync(t => t.TicketId == ticketId && !t.IsDeleted);

            if (ticket == null) return null;

            ticket.Summary = ticketUpdateDto.Summary ?? ticket.Summary;
            ticket.Description = ticketUpdateDto.Description ?? ticket.Description;
            ticket.StatusId = ticketUpdateDto.StatusId ?? ticket.StatusId;
            ticket.CompletionDate = ticketUpdateDto.CompletionDate ?? ticket.CompletionDate;
            ticket.ResolutionDetail = ticketUpdateDto.ResolutionDetail ?? ticket.ResolutionDetail;
            ticket.Comment = ticketUpdateDto.Comment ?? ticket.Comment;
            ticket.IsDeleted = ticketUpdateDto.IsDeleted ?? ticket.IsDeleted;
            ticket.UpdatedByUserId = updatedByUserId;
            ticket.UpdatedDate = DateTime.UtcNow;

            if (ticketUpdateDto.IsDeleted == true)
            {
                ticket.DeletedDate = DateTime.UtcNow;
            }

            // Update specific details based on existing type
            switch (ticket.TypeId)
            {
                case 1: // Technical
                    if (ticket.TechnicalDetail != null && ticketUpdateDto.TechnicalDetail != null)
                    {
                        ticket.TechnicalDetail.ProblemTypeId = ticketUpdateDto.TechnicalDetail.ProblemTypeId ?? ticket.TechnicalDetail.ProblemTypeId;
                        ticket.TechnicalDetail.ResolutionProvidedByUserId = ticketUpdateDto.TechnicalDetail.ResolutionProvidedByUserId ?? ticket.TechnicalDetail.ResolutionProvidedByUserId;
                        ticket.TechnicalDetail.AnyDeskDetail = ticketUpdateDto.TechnicalDetail.AnyDeskDetail ?? ticket.TechnicalDetail.AnyDeskDetail;
                    }
                    break;
                case 2: // Withdrawal
                    if (ticket.WithdrawalDetail != null && ticketUpdateDto.WithdrawalDetail != null)
                    {
                        ticket.WithdrawalDetail.Amount = ticketUpdateDto.WithdrawalDetail.Amount ?? ticket.WithdrawalDetail.Amount;
                        ticket.WithdrawalDetail.Account = ticketUpdateDto.WithdrawalDetail.Account ?? ticket.WithdrawalDetail.Account;
                        ticket.WithdrawalDetail.IsConfigured = ticketUpdateDto.WithdrawalDetail.IsConfigured ?? ticket.WithdrawalDetail.IsConfigured;
                        ticket.WithdrawalDetail.IsMake = ticketUpdateDto.WithdrawalDetail.IsMake ?? ticket.WithdrawalDetail.IsMake;
                        ticket.WithdrawalDetail.IsAuthorized = ticketUpdateDto.WithdrawalDetail.IsAuthorized ?? ticket.WithdrawalDetail.IsAuthorized;
                        ticket.WithdrawalDetail.AuthorizedAmount = ticketUpdateDto.WithdrawalDetail.AuthorizedAmount ?? ticket.WithdrawalDetail.AuthorizedAmount;
                    }
                    break;
                case 3: // Deposit
                    if (ticket.DepositDetail != null && ticketUpdateDto.DepositDetail != null)
                    {
                        ticket.DepositDetail.Amount = ticketUpdateDto.DepositDetail.Amount ?? ticket.DepositDetail.Amount;
                        ticket.DepositDetail.DepositDate = ticketUpdateDto.DepositDetail.DepositDate?.ToUniversalTime() ?? ticket.DepositDetail.DepositDate;
                        ticket.DepositDetail.HasReceipt = ticketUpdateDto.DepositDetail.HasReceipt ?? ticket.DepositDetail.HasReceipt;
                        ticket.DepositDetail.ReceiptSource = ticketUpdateDto.DepositDetail.ReceiptSource ?? ticket.DepositDetail.ReceiptSource;
                        ticket.DepositDetail.IsVerified = ticketUpdateDto.DepositDetail.IsVerified ?? ticket.DepositDetail.IsVerified;
                    }
                    break;
            }

            await _context.SaveChangesAsync();

            // Fetch the updated ticket with all includes for DTO mapping
            var updatedTicket = await GetTicketsQuery().FirstOrDefaultAsync(t => t.TicketId == ticketId);
            return MapTicketToDto(updatedTicket!); // updatedTicket should not be null here
        }

        public async Task<bool> DeleteTicketAsync(Guid ticketId, int deletedByUserId)
        {
            var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.TicketId == ticketId && !t.IsDeleted);
            if (ticket == null) return false;

            ticket.IsDeleted = true;
            ticket.DeletedDate = DateTime.UtcNow;
            ticket.UpdatedByUserId = deletedByUserId;
            ticket.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateTicketStatusAsync(Guid ticketId, int newStatusId, int updatedByUserId)
        {
            var ticket = await _context.Tickets.Include(t => t.RaisedByUser).FirstOrDefaultAsync(t => t.TicketId == ticketId && !t.IsDeleted);
            if (ticket == null) return false;

            // Log status change
            _context.TicketHistory.Add(new TicketHistory
            {
                TicketId = ticket.TicketId,
                ChangeType = "Status Change",
                OldValue = ticket.StatusId.ToString(),
                NewValue = newStatusId.ToString(),
                ChangedByUserId = updatedByUserId,
                ChangedDate = DateTime.UtcNow
            });

            ticket.StatusId = newStatusId;
            ticket.UpdatedByUserId = updatedByUserId;
            ticket.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // --- Notify the ticket creator about the status change ---
            if (ticket.RaisedByUserId != updatedByUserId && ticket.RaisedByUser != null)
            {
                var statusName = await _context.TicketStatuses
                    .Where(s => s.StatusId == newStatusId)
                    .Select(s => s.StatusName)
                    .FirstOrDefaultAsync() ?? $"Status {newStatusId}";

                var broadcast = new Broadcast
                {
                    Title = "Ticket Status Updated",
                    Message = $"Your ticket (#{ticket.TicketId}) status has changed to: {statusName}",
                    Priority = "Normal",
                    SentByUserId = updatedByUserId,
                    TargetRoles = ticket.RaisedByUser.Role != null ? ticket.RaisedByUser.Role.Name : "",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };
                _context.Broadcasts.Add(broadcast);
                await _context.SaveChangesAsync();

                var receipt = new BroadcastReceipt
                {
                    BroadcastId = broadcast.Id,
                    UserId = ticket.RaisedByUserId
                };
                _context.BroadcastReceipts.Add(receipt);
                await _context.SaveChangesAsync();
            }
            // --- End notification logic ---

            return true;
        }

        public async Task<bool> AddCommentToTicketAsync(Guid ticketId, string comment, int commentedByUserId)
        {
            var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.TicketId == ticketId && !t.IsDeleted);
            if (ticket == null) return false;

            // Use StringBuilder for better performance with string concatenation
            var commentBuilder = new System.Text.StringBuilder();
            if (!string.IsNullOrEmpty(ticket.Comment))
            {
                commentBuilder.Append(ticket.Comment).Append("\n");
            }
            commentBuilder.Append($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm}] (User: {commentedByUserId}): {comment}");
            ticket.Comment = commentBuilder.ToString();

            // Log comment addition
            _context.TicketHistory.Add(new TicketHistory
            {
                TicketId = ticket.TicketId,
                ChangeType = "Comment Added",
                OldValue = null,
                NewValue = comment,
                ChangedByUserId = commentedByUserId,
                ChangedDate = DateTime.UtcNow
            });

            ticket.UpdatedByUserId = commentedByUserId;
            ticket.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
