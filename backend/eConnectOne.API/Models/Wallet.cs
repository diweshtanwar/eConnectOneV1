using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace eConnectOne.API.Models
{
    public class Wallet
    {
        [Key]
        public Guid WalletId { get; set; } = Guid.NewGuid();

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Balance { get; set; } = 0;

        [Column(TypeName = "decimal(18, 2)")]
        public decimal PendingAmount { get; set; } = 0;

        public bool IsActive { get; set; } = true;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }

        // Navigation property for transactions
        public ICollection<WalletTransaction>? Transactions { get; set; }
    }

    public class WalletTransaction
    {
        [Key]
        public Guid TransactionId { get; set; } = Guid.NewGuid();

        public Guid WalletId { get; set; }
        [ForeignKey("WalletId")]
        public Wallet? Wallet { get; set; }

        public Guid? TicketId { get; set; }
        [ForeignKey("TicketId")]
        public Ticket? Ticket { get; set; }

        [Required]
        [StringLength(20)]
        public required string TransactionType { get; set; } // DEPOSIT, WITHDRAWAL, ADJUSTMENT

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal BalanceAfter { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "PENDING"; // PENDING, COMPLETED, FAILED

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public int CreatedByUserId { get; set; }
        [ForeignKey("CreatedByUserId")]
        public User? CreatedByUser { get; set; }
    }
}