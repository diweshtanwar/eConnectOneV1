using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // Added for ForeignKey attribute

namespace eConnectOne.API.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public required string Username { get; set; }

        [Required]
        public required string PasswordHash { get; set; }

        // New columns
        [StringLength(20)]
        public string? MobileNumber { get; set; }

        [StringLength(20)]
        public string? EmergencyContactNumber { get; set; }

        [StringLength(255)]
        public string? FatherName { get; set; }

        [StringLength(255)]
        public string? MotherName { get; set; }

        // RoleId instead of Role string
        public int RoleId { get; set; }

        [ForeignKey("RoleId")]
        public Role? Role { get; set; } // Navigation property to the Role entity

        // Navigation properties for related details
        public GeneralUserDetails? GeneralUserDetails { get; set; }
        public UserDetails? UserDetails { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public DateTime? UpdatedDate { get; set; } // Added this line
        public bool IsActive { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }

        // Account lockout fields
        public int FailedLoginAttempts { get; set; } = 0;
        public bool IsLocked { get; set; } = false;
        public DateTime? LockedUntil { get; set; }
        public DateTime? LastFailedLoginAt { get; set; }

        // Soft delete columns
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedDate { get; set; }
    }
}
