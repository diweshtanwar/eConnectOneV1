using System.ComponentModel.DataAnnotations;

namespace eConnectOne.API.Models
{
    public class RolePermission
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int RoleId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Permission { get; set; } = string.Empty; // e.g., "UserManagement", "TicketManagement", "Dashboard"
        
        public bool CanView { get; set; } = false;
        public bool CanCreate { get; set; } = false;
        public bool CanEdit { get; set; } = false;
        public bool CanDelete { get; set; } = false;
        
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }
        public bool IsDeleted { get; set; } = false;
        
        // Navigation property
        public virtual Role? Role { get; set; }
    }
}