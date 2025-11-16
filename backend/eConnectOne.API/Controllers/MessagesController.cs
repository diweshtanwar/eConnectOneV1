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
    public class MessagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MessagesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("inbox")]
        public async Task<ActionResult> GetInbox([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            
            // Only show messages sent TO this user
            var messages = await _context.Messages
                .Include(m => m.FromUser)
                .Where(m => m.ToUserId == userId && !m.IsDeleted)
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(m => new {
                    m.Id,
                    m.Subject,
                    m.Body,
                    m.IsRead,
                    m.CreatedAt,
                    m.Priority,
                    FromUser = m.FromUser!.FullName ?? m.FromUser.Username
                })
                .ToListAsync();

            return Ok(messages);
        }

        [HttpGet("sent")]
        public async Task<ActionResult> GetSentMessages([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            
            // Only show messages sent BY this user
            var messages = await _context.Messages
                .Include(m => m.ToUser)
                .Where(m => m.FromUserId == userId && !m.IsDeleted)
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(m => new {
                    m.Id,
                    m.Subject,
                    m.Body,
                    m.CreatedAt,
                    m.Priority,
                    ToUser = m.ToUser!.FullName ?? m.ToUser.Username
                })
                .ToListAsync();

            return Ok(messages);
        }

        [HttpPost("send")]
        public async Task<ActionResult> SendMessage([FromBody] SendMessageDto dto)
        {
            var userId = GetCurrentUserId();
            
            // Prevent sending message to self
            if (dto.ToUserId == userId)
            {
                return BadRequest(new { message = "You cannot send a message to yourself" });
            }
            
            // Validate recipient exists
            var recipientExists = await _context.Users.AnyAsync(u => u.Id == dto.ToUserId && !u.IsDeleted);
            if (!recipientExists)
            {
                return BadRequest(new { message = "Recipient user not found" });
            }
            
            var message = new Message
            {
                FromUserId = userId,
                ToUserId = dto.ToUserId,
                Subject = dto.Subject,
                Body = dto.Body,
                Priority = dto.Priority ?? "Normal"
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Message sent successfully", id = message.Id });
        }

        [HttpPut("{id}/read")]
        public async Task<ActionResult> MarkAsRead(int id)
        {
            var userId = GetCurrentUserId();
            // Only allow marking as read if message was sent TO this user
            var message = await _context.Messages.FirstOrDefaultAsync(m => m.Id == id && m.ToUserId == userId);
            
            if (message == null) return NotFound("Message not found or access denied");

            message.IsRead = true;
            message.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok();
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 1;
        }
    }

    public class SendMessageDto
    {
        public int ToUserId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? Priority { get; set; }
    }
}