using System.ComponentModel.DataAnnotations;

namespace eConnectOne.API.Models
{
    public class ChatMessage
    {
        [Key]
        public int Id { get; set; }
        
        public string ConversationId { get; set; } = string.Empty;
        
        public int FromUserId { get; set; }
        public User? FromUser { get; set; }
        
        public int ToUserId { get; set; }
        public User? ToUser { get; set; }
        
        public string Message { get; set; } = string.Empty;
        
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }
        
        public bool IsDeleted { get; set; } = false;
        public string MessageType { get; set; } = "text"; // text, image, file
    }
}