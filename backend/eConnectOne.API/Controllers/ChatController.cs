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
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ChatController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("conversations")]
        public async Task<ActionResult> GetConversations()
        {
            var userId = GetCurrentUserId();
            
            // Only get conversations where user is directly involved
            var conversations = await _context.ChatMessages
                .Include(m => m.FromUser)
                .Include(m => m.ToUser)
                .Where(m => (m.FromUserId == userId || m.ToUserId == userId || 
                           (m.ConversationId.StartsWith("group_") && 
                            _context.GroupChatMembers.Any(gcm => gcm.GroupId == m.ConversationId && gcm.UserId == userId && gcm.IsActive))) 
                           && !m.IsDeleted)
                .GroupBy(m => m.ConversationId)
                .Select(g => new {
                    ConversationId = g.Key,
                    LastMessage = g.OrderByDescending(m => m.CreatedAt).First().Message,
                    LastMessageTime = g.OrderByDescending(m => m.CreatedAt).First().CreatedAt,
                    UnreadCount = g.Count(m => m.ToUserId == userId && !m.IsRead),
                    IsGroup = g.Key.StartsWith("group_"),
                    ChatName = g.Key.StartsWith("group_") ? 
                        _context.GroupChats.Where(gc => gc.GroupId == g.Key).Select(gc => gc.GroupName).FirstOrDefault() :
                        (g.First().FromUserId == userId ? 
                            g.First().ToUser!.FullName ?? g.First().ToUser.Username :
                            g.First().FromUser!.FullName ?? g.First().FromUser.Username),
                    MemberCount = g.Key.StartsWith("group_") ? 
                        _context.GroupChatMembers.Count(gcm => gcm.GroupId == g.Key && gcm.IsActive) : 2
                })
                .OrderByDescending(c => c.LastMessageTime)
                .ToListAsync();

            return Ok(conversations);
        }

        [HttpGet("messages/{conversationId}")]
        public async Task<ActionResult> GetMessages(string conversationId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var userId = GetCurrentUserId();
            
            // Verify user has access to this conversation
            bool hasAccess = false;
            
            if (conversationId.StartsWith("group_"))
            {
                // Check if user is a member of the group
                hasAccess = await _context.GroupChatMembers
                    .AnyAsync(gcm => gcm.GroupId == conversationId && gcm.UserId == userId && gcm.IsActive);
            }
            else
            {
                // Check if user is part of individual conversation
                hasAccess = await _context.ChatMessages
                    .AnyAsync(m => m.ConversationId == conversationId && 
                                  (m.FromUserId == userId || m.ToUserId == userId));
            }
            
            if (!hasAccess)
            {
                return Forbid("You don't have access to this conversation");
            }
            
            var messages = await _context.ChatMessages
                .Include(m => m.FromUser)
                .Where(m => m.ConversationId == conversationId && !m.IsDeleted)
                .OrderBy(m => m.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(m => new {
                    m.Id,
                    m.Message,
                    m.CreatedAt,
                    m.IsRead,
                    IsOwn = m.FromUserId == userId,
                    FromUser = m.FromUser!.FullName ?? m.FromUser.Username
                })
                .ToListAsync();

            return Ok(messages);
        }

        [HttpPost("send")]
        public async Task<ActionResult> SendMessage([FromBody] SendChatMessageDto dto)
        {
            var userId = GetCurrentUserId();
            
            // Generate conversation ID if not provided
            var conversationId = dto.ConversationId;
            if (string.IsNullOrEmpty(conversationId))
            {
                if (dto.IsGroup && dto.GroupMembers != null && dto.GroupMembers.Any())
                {
                    // Create group conversation
                    conversationId = $"group_{Guid.NewGuid()}";
                }
                else
                {
                    // Create individual conversation
                    var userIds = new[] { userId, dto.ToUserId }.OrderBy(x => x);
                    conversationId = $"chat_{userIds.First()}_{userIds.Last()}";
                }
            }

            var message = new ChatMessage
            {
                ConversationId = conversationId,
                FromUserId = userId,
                ToUserId = dto.ToUserId,
                Message = dto.Message,
                MessageType = dto.MessageType ?? "text"
            };

            _context.ChatMessages.Add(message);
            
            // If it's a new group, create group record and members
            if (dto.IsGroup && dto.GroupMembers != null && !_context.GroupChats.Any(g => g.GroupId == conversationId))
            {
                var group = new GroupChat
                {
                    GroupId = conversationId,
                    GroupName = dto.GroupName ?? "New Group",
                    CreatedByUserId = userId
                };
                _context.GroupChats.Add(group);
                
                // Add creator as admin
                _context.GroupChatMembers.Add(new GroupChatMember
                {
                    GroupId = conversationId,
                    UserId = userId,
                    IsAdmin = true
                });
                
                // Add other members
                foreach (var memberId in dto.GroupMembers)
                {
                    if (memberId != userId)
                    {
                        _context.GroupChatMembers.Add(new GroupChatMember
                        {
                            GroupId = conversationId,
                            UserId = memberId
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Message sent successfully", 
                id = message.Id,
                conversationId = conversationId
            });
        }

        [HttpPut("read/{conversationId}")]
        public async Task<ActionResult> MarkConversationAsRead(string conversationId)
        {
            var userId = GetCurrentUserId();
            
            var messages = await _context.ChatMessages
                .Where(m => m.ConversationId == conversationId && m.ToUserId == userId && !m.IsRead)
                .ToListAsync();

            foreach (var message in messages)
            {
                message.IsRead = true;
                message.ReadAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 1;
        }
    }

    public class SendChatMessageDto
    {
        public string? ConversationId { get; set; }
        public int ToUserId { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? MessageType { get; set; }
        public bool IsGroup { get; set; } = false;
        public string? GroupName { get; set; }
        public List<int>? GroupMembers { get; set; }
    }
}