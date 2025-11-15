using System.ComponentModel.DataAnnotations;

namespace eConnectOne.API.Models
{
    public class ResourceCategory
    {
        [Key]
        public int Id { get; set; }
        
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = "Folder"; // Material-UI icon name
        public string Color { get; set; } = "primary"; // Theme color
        
        public int SortOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<Resource> Resources { get; set; } = new List<Resource>();
    }

    public class Resource
    {
        [Key]
        public int Id { get; set; }
        
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ResourceType { get; set; } = "Link"; // Link, File, Video, Document
        
        // For external links (Google Drive, Cloud, etc.)
        public string? ExternalUrl { get; set; }
        
        // For uploaded files
        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public long? FileSize { get; set; }
        public string? MimeType { get; set; }
        
        public int CategoryId { get; set; }
        public ResourceCategory? Category { get; set; }
        
        public string TargetRoles { get; set; } = "All"; // All, CSP, Admin, etc.
        public string Priority { get; set; } = "Normal"; // Low, Normal, High
        
        public int UploadedByUserId { get; set; }
        public User? UploadedByUser { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        public bool IsActive { get; set; } = true;
        public bool IsFeatured { get; set; } = false;
        
        public int DownloadCount { get; set; } = 0;
        public int ViewCount { get; set; } = 0;
    }

    public class ResourceAccess
    {
        [Key]
        public int Id { get; set; }
        
        public int ResourceId { get; set; }
        public Resource? Resource { get; set; }
        
        public int UserId { get; set; }
        public User? User { get; set; }
        
        public string AccessType { get; set; } = "View"; // View, Download
        public DateTime AccessedAt { get; set; } = DateTime.UtcNow;
        public string? UserAgent { get; set; }
        public string? IpAddress { get; set; }
    }
}