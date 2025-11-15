namespace eConnectOne.API.DTOs
{
    public class BulkImportResultDto
    {
        public int TotalRecords { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public List<ImportLogDto> Logs { get; set; } = new();
    }

    public class ImportLogDto
    {
    public int RowNumber { get; set; }
    public string Status { get; set; } = string.Empty; // Success, Failed
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
    }

    public class UserImportDto
    {
    // Username removed, use UserId for relationships
        public string Password { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string FatherName { get; set; } = string.Empty;
        public string MotherName { get; set; } = string.Empty;
    }
}