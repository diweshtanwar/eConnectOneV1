namespace eConnectOne.API.DTOs
{
    public class UserFullDetailsDto
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
        public string RoleName { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public GeneralUserDetailDto? GeneralDetails { get; set; }
        public UserDetailDto? UserDetails { get; set; }
        public List<UserDocumentDto> Documents { get; set; } = new();
    }
}
