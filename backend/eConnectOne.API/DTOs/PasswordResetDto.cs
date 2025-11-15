using System.ComponentModel.DataAnnotations;

namespace eConnectOne.API.DTOs
{
    public class PasswordResetDto
    {
        [Required]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters long.")]
        public string NewPassword { get; set; } = string.Empty;
    }
}