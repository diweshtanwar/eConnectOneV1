using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace eConnectOne.API.Models
{
    public class WithdrawalDetail
    {
        [Key]
        public Guid TicketId { get; set; }

        [ForeignKey("TicketId")]
        public Ticket? Ticket { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }

        [StringLength(100)]
        public string? Account { get; set; }

        public bool IsConfigured { get; set; } = false;
        public bool IsMake { get; set; } = false;
        public bool IsAuthorized { get; set; } = false;

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? AuthorizedAmount { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? ApprovedAmount { get; set; }

        public int? ApprovedByUserId { get; set; }
        [ForeignKey("ApprovedByUserId")]
        public User? ApprovedByUser { get; set; }

        public DateTime? ApprovedDate { get; set; }

        [StringLength(500)]
        public string? ApprovalComment { get; set; }
    }
}
