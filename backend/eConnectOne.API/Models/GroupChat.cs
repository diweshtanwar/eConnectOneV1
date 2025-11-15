using System.ComponentModel.DataAnnotations;

namespace eConnectOne.API.Models
{
    public class GroupChat
    {
        [Key]
        public int Id { get; set; }
        
        public string GroupId { get; set; } = string.Empty;
        public string GroupName { get; set; } = string.Empty;
        public string? GroupDescription { get; set; }
        
        public int CreatedByUserId { get; set; }
        public User? CreatedByUser { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public ICollection<GroupChatMember> Members { get; set; } = new List<GroupChatMember>();
        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }

    public class GroupChatMember
    {
        [Key]
        public int Id { get; set; }
        
        public string GroupId { get; set; } = string.Empty;
        public GroupChat? Group { get; set; }
        
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        public bool IsAdmin { get; set; } = false;
        public bool IsActive { get; set; } = true;
    }
}