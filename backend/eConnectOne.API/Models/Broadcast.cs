using System.ComponentModel.DataAnnotations;

namespace eConnectOne.API.Models
{
    public class Broadcast
    {
        [Key]
        public int Id { get; set; }
        
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Priority { get; set; } = "Normal"; // Low, Normal, High, Critical
        
        public int SentByUserId { get; set; }
        public User? SentByUser { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ExpiresAt { get; set; }
        
        public bool IsActive { get; set; } = true;
        public string TargetRoles { get; set; } = "All"; // All, CSP, Admin, etc.
        
        // Navigation properties
        public ICollection<BroadcastReceipt> Receipts { get; set; } = new List<BroadcastReceipt>();
    }

    public class BroadcastReceipt
    {
        [Key]
        public int Id { get; set; }
        
        public int BroadcastId { get; set; }
        public Broadcast? Broadcast { get; set; }
        
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}