using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using eConnectOne.API.Data;
using eConnectOne.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace eConnectOne.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BroadcastController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BroadcastController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("send")]
        [Authorize(Roles = "Admin,Master Admin")]
        public async Task<ActionResult> SendBroadcast([FromBody] SendBroadcastDto dto)
        {
            var userId = GetCurrentUserId();
            
            var broadcast = new Broadcast
            {
                Title = dto.Title,
                Message = dto.Message,
                Priority = dto.Priority ?? "Normal",
                SentByUserId = userId,
                TargetRoles = dto.TargetRoles ?? "All",
                ExpiresAt = dto.ExpiresAt
            };

            _context.Broadcasts.Add(broadcast);
            await _context.SaveChangesAsync();

            // Create receipts for all target users
            var targetUsers = await GetTargetUsers(dto.TargetRoles ?? "All");
            
            var receipts = targetUsers.Select(user => new BroadcastReceipt
            {
                BroadcastId = broadcast.Id,
                UserId = user.Id
            }).ToList();

            _context.BroadcastReceipts.AddRange(receipts);
            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Broadcast sent successfully", 
                id = broadcast.Id,
                recipientCount = receipts.Count 
            });
        }

        // Get all broadcasts (Master Admin and Admin)
        [HttpGet("all")]
        [Authorize(Roles = "Master Admin,Admin")]
        public async Task<ActionResult> GetAllBroadcasts()
        {
            var broadcasts = await _context.Broadcasts
                .Include(b => b.SentByUser)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new {
                    b.Id,
                    b.Title,
                    b.Message,
                    b.Priority,
                    b.CreatedAt,
                    b.ExpiresAt,
                    b.IsActive,
                    b.TargetRoles,
                    SentBy = b.SentByUser!.FullName ?? b.SentByUser.Username
                })
                .ToListAsync();
            return Ok(broadcasts);
        }

        // Get broadcasts received by current user ("My Broadcasts")
        [HttpGet("my")]
        public async Task<ActionResult> GetMyBroadcasts()
        {
            var userId = GetCurrentUserId();
            var myBroadcasts = await _context.BroadcastReceipts
                .Include(br => br.Broadcast)
                .ThenInclude(b => b!.SentByUser)
                .Where(br => br.UserId == userId && br.Broadcast != null && br.Broadcast.IsActive)
                .OrderByDescending(br => br.Broadcast!.CreatedAt)
                .Select(br => new {
                    br.BroadcastId,
                    br.Broadcast!.Title,
                    br.Broadcast.Message,
                    br.Broadcast.Priority,
                    br.Broadcast.CreatedAt,
                    br.Broadcast.ExpiresAt,
                    br.Broadcast.IsActive,
                    br.Broadcast.TargetRoles,
                    SentBy = br.Broadcast.SentByUser!.FullName ?? br.Broadcast.SentByUser.Username,
                    br.IsRead,
                    br.ReadAt
                })
                .ToListAsync();
            return Ok(myBroadcasts);
        }

        // Edit a broadcast (Master Admin and Admin)
        [HttpPut("edit/{id}")]
        [Authorize(Roles = "Master Admin,Admin")]
        public async Task<ActionResult> EditBroadcast(int id, [FromBody] SendBroadcastDto dto)
        {
            var broadcast = await _context.Broadcasts.FindAsync(id);
            if (broadcast == null) return NotFound();

            broadcast.Title = dto.Title;
            broadcast.Message = dto.Message;
            broadcast.Priority = dto.Priority ?? broadcast.Priority;
            broadcast.TargetRoles = dto.TargetRoles ?? broadcast.TargetRoles;
            broadcast.ExpiresAt = dto.ExpiresAt;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Broadcast updated successfully" });
        }

        // Delete a broadcast (Master Admin and Admin)
        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "Master Admin,Admin")]
        public async Task<ActionResult> DeleteBroadcast(int id)
        {
            var broadcast = await _context.Broadcasts.FindAsync(id);
            if (broadcast == null) return NotFound();

            _context.Broadcasts.Remove(broadcast);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Broadcast deleted successfully" });
        }

        [HttpGet("notifications")]
        public async Task<ActionResult> GetNotifications()
        {
            var userId = GetCurrentUserId();
            
            var notifications = await _context.BroadcastReceipts
                .Include(br => br.Broadcast)
                .ThenInclude(b => b!.SentByUser)
                .Where(br => br.UserId == userId && 
                           br.Broadcast!.IsActive && 
                           (br.Broadcast.ExpiresAt == null || br.Broadcast.ExpiresAt > DateTime.UtcNow))
                .OrderByDescending(br => br.Broadcast!.CreatedAt)
                .Select(br => new {
                    br.Id,
                    br.BroadcastId,
                    br.Broadcast!.Title,
                    br.Broadcast.Message,
                    br.Broadcast.Priority,
                    br.Broadcast.CreatedAt,
                    br.IsRead,
                    br.ReadAt,
                    SentBy = br.Broadcast.SentByUser!.FullName ?? br.Broadcast.SentByUser.Username
                })
                .ToListAsync();

            return Ok(notifications);
        }

        [HttpPut("read/{receiptId}")]
        public async Task<ActionResult> MarkAsRead(int receiptId)
        {
            var userId = GetCurrentUserId();
            var receipt = await _context.BroadcastReceipts
                .FirstOrDefaultAsync(br => br.Id == receiptId && br.UserId == userId);
            
            if (receipt == null) return NotFound();

            receipt.IsRead = true;
            receipt.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("unread-count")]
        public async Task<ActionResult> GetUnreadCount()
        {
            var userId = GetCurrentUserId();
            
            var count = await _context.BroadcastReceipts
                .CountAsync(br => br.UserId == userId && 
                                !br.IsRead && 
                                br.Broadcast!.IsActive &&
                                (br.Broadcast.ExpiresAt == null || br.Broadcast.ExpiresAt > DateTime.UtcNow));

            return Ok(new { unreadCount = count });
        }

        private async Task<List<User>> GetTargetUsers(string targetRoles)
        {
            if (targetRoles == "All")
            {
                return await _context.Users
                    .Where(u => !u.IsDeleted && u.IsActive)
                    .ToListAsync();
            }

            var roles = targetRoles.Split(',').Select(r => r.Trim()).ToList();
            return await _context.Users
                .Include(u => u.Role)
                .Where(u => !u.IsDeleted && u.IsActive && roles.Contains(u.Role!.Name))
                .ToListAsync();
        }

    private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 1;
        }
    }

    public class SendBroadcastDto
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Priority { get; set; }
        public string? TargetRoles { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }
}