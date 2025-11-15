using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace eConnectOne.API.Models
{
    public class Attachment
    {
        [Key]
        public Guid AttachmentId { get; set; } = Guid.NewGuid();

        public Guid TicketId { get; set; }
        [ForeignKey("TicketId")]
        public Ticket? Ticket { get; set; }

        [Required]
        [StringLength(255)]
        public string FileName { get; set; }

        [Required]
        public string FilePath { get; set; }

        [StringLength(50)]
        public string? FileType { get; set; }

        public int UploadedByUserId { get; set; }
        [ForeignKey("UploadedByUserId")]
        public User? UploadedByUser { get; set; }

        public DateTime UploadedDate { get; set; } = DateTime.UtcNow;
    }
}
