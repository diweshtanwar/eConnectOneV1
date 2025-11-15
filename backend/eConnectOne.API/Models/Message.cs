using System.ComponentModel.DataAnnotations;

namespace eConnectOne.API.Models
{
    public class Message
    {
        [Key]
        public int Id { get; set; }
        
        public int FromUserId { get; set; }
        public User? FromUser { get; set; }
        
        public int ToUserId { get; set; }
        public User? ToUser { get; set; }
        
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }
        
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        
        public string Priority { get; set; } = "Normal"; // Low, Normal, High
        public bool HasAttachment { get; set; } = false;
    }
}