using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace eConnectOne.API.Models
{
    public class UserDocuments
    {
        public int Id { get; set; }




    [Required]
    [StringLength(50)]
    public string Code { get; set; } = null!;

    // New: UserId FK to Users table
    public int UserId { get; set; }
    [ForeignKey("UserId")]
    public User? User { get; set; }

    public UserDetails? UserDetails { get; set; }

    [Required]
    [StringLength(50)]
    public string DocumentType { get; set; } = string.Empty; // e.g., 'PassportSizePhoto', 'VoterIdImage'

    [Required]
    [StringLength(500)]
    public string DocumentPath { get; set; } = string.Empty;

        public DateTime UploadedDate { get; set; } // Renamed from UploadDate

        [StringLength(255)]
        public string? Description { get; set; }

        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedDate { get; set; }

        public DateTime CreatedDate { get; set; } // Added
        public DateTime? UpdatedDate { get; set; } // Added
    }
}