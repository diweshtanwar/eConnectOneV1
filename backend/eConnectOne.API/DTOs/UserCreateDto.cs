using System.ComponentModel.DataAnnotations;

namespace eConnectOne.API.DTOs
{
    public class UserCreateDto
    {
    [Required]
    [StringLength(100)]
    public required string Username { get; set; }

    [Required]
    public required string Password { get; set; } // Raw password for creation

        [Required]
        public int RoleId { get; set; } // Foreign key to Role

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

        // For CSP users: CSPCode is required
        [StringLength(50)]
        public string? CSPCode { get; set; }
    }
}
