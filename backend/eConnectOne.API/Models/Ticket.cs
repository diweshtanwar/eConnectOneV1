using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace eConnectOne.API.Models
{
    public class Ticket
    {
        [Key]
        public Guid TicketId { get; set; } = Guid.NewGuid();

        public int TypeId { get; set; }
        [ForeignKey("TypeId")]
        public TicketType? TicketType { get; set; }

        public int RaisedByUserId { get; set; }
        [ForeignKey("RaisedByUserId")]
        public User? RaisedByUser { get; set; }

        [StringLength(255)]
        public string? RequesterEmail { get; set; }

        [StringLength(20)]
        public string? RequesterMobile { get; set; }

        [Required]
        [StringLength(255)]
        public string Summary { get; set; }

        public string? Description { get; set; }

        public int StatusId { get; set; }
        [ForeignKey("StatusId")]
        public TicketStatus? TicketStatus { get; set; }

        public DateTime RequestedDate { get; set; } = DateTime.UtcNow;
        public DateTime? CompletionDate { get; set; }

        public string? ResolutionDetail { get; set; }

        public string? Comment { get; set; }

        public int CreatedByUserId { get; set; }
        [ForeignKey("CreatedByUserId")]
        public User? CreatedByUser { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public int? UpdatedByUserId { get; set; }
        [ForeignKey("UpdatedByUserId")]
        public User? UpdatedByUser { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedDate { get; set; }

        [StringLength(10)]
        public string Priority { get; set; } = "MEDIUM";

        public int PriorityScore { get; set; } = 50;

        // Navigation properties for one-to-one relationships with detail tables
        public TechnicalDetail? TechnicalDetail { get; set; }
        public WithdrawalDetail? WithdrawalDetail { get; set; }
        public DepositDetail? DepositDetail { get; set; }

        // Navigation property for attachments
        public ICollection<Attachment>? Attachments { get; set; }

        // Navigation property for history
        public ICollection<TicketHistory>? TicketHistory { get; set; }
    }
}
