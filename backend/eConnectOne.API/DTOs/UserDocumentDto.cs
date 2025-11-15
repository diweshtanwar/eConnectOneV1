namespace eConnectOne.API.DTOs
{
    public class UserDocumentDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string DocumentType { get; set; } = string.Empty;
        public string DocumentPath { get; set; } = string.Empty;
        public DateTime UploadedDate { get; set; }
    }

    public class UserDocumentCreateDto
    {
        public string Code { get; set; } = string.Empty;
        public string DocumentType { get; set; } = string.Empty;
        public string DocumentPath { get; set; } = string.Empty;
    }

    public class UserDocumentUpdateDto
    {
        public string? DocumentType { get; set; }
        public string? DocumentPath { get; set; }
    }
}
