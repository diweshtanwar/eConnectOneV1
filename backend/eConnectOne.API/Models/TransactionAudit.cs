using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace eConnectOne.API.Models
{
    public class TransactionAudit
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid? TicketId { get; set; }
        [ForeignKey("TicketId")]
        public Ticket? Ticket { get; set; }

        public Guid? WalletTransactionId { get; set; }
        [ForeignKey("WalletTransactionId")]
        public WalletTransaction? WalletTransaction { get; set; }

        [Required]
        [StringLength(50)]
        public required string Action { get; set; } // CREATED, APPROVED, REJECTED, MODIFIED

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? OldAmount { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? NewAmount { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? BalanceBefore { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal? BalanceAfter { get; set; }

        public int PerformedByUserId { get; set; }
        [ForeignKey("PerformedByUserId")]
        public User? PerformedByUser { get; set; }

        [StringLength(100)]
        public string? IpAddress { get; set; }

        [StringLength(500)]
        public string? UserAgent { get; set; }

        [StringLength(1000)]
        public string? Reason { get; set; }

        [StringLength(20)]
        public string RiskLevel { get; set; } = "LOW"; // LOW, MEDIUM, HIGH, CRITICAL

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}