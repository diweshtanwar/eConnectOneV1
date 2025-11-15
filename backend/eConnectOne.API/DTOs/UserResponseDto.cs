using System.ComponentModel.DataAnnotations;
using eConnectOne.API.Models; // For Role model

namespace eConnectOne.API.DTOs
{
    public class UserResponseDto
    {
    public int Id { get; set; }
    public string? Username { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? MobileNumber { get; set; }
        public string? EmergencyContactNumber { get; set; }
        public string? FatherName { get; set; }
        public string? MotherName { get; set; }
    public int RoleId { get; set; }
    public string RoleName { get; set; } // Display role name
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }

        // Include detail DTOs based on role
        public GeneralUserDetailDto? GeneralDetails { get; set; }
    public UserDetailDto? UserDetails { get; set; }
    }
}
