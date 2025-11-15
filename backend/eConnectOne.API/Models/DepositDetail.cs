using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace eConnectOne.API.Models
{
    public class DepositDetail
    {
        [Key]
        public Guid TicketId { get; set; }

        [ForeignKey("TicketId")]
        public Ticket? Ticket { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }

        public DateTime? DepositDate { get; set; }

        public bool HasReceipt { get; set; } = false;

        public string? ReceiptSource { get; set; }

        public bool IsVerified { get; set; } = false;

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
