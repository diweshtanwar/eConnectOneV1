using System.ComponentModel.DataAnnotations;

namespace eConnectOne.API.DTOs
{
    public class UserUpdateDto
    {
    // Username removed, use UserId for relationships

        public string? Password { get; set; } // Raw password for update

        public int? RoleId { get; set; } // Nullable for partial updates

        [StringLength(255)]
        public string? Email { get; set; }

        [StringLength(255)]
        public string? FullName { get; set; }

        [StringLength(20)]
        public string? MobileNumber { get; set; }

        [StringLength(20)]
        public string? EmergencyContactNumber { get; set; }

        [StringLength(255)]
        public string? FatherName { get; set; }

        [StringLength(255)]
        public string? MotherName { get; set; }

        public bool? IsActive { get; set; } // For activating/deactivating user
    }
}
