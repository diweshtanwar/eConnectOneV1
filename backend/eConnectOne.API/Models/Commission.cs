using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace eConnectOne.API.Models
{
    public class Commission
    {
        [Key]
        public Guid CommissionId { get; set; } = Guid.NewGuid();

        public int CSPUserId { get; set; }
        [ForeignKey("CSPUserId")]
        public User? CSPUser { get; set; }

        public int Month { get; set; } // 1-12
        public int Year { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal BaseCommission { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal BonusCommission { get; set; } = 0;

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Deductions { get; set; } = 0;

        [Column(TypeName = "decimal(18, 2)")]
        public decimal TotalCommission { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal TaxDeducted { get; set; } = 0;

        [Column(TypeName = "decimal(18, 2)")]
        public decimal NetPayable { get; set; }

        [StringLength(20)]
        public string Status { get; set; } = "PENDING"; // PENDING, APPROVED, PAID, REJECTED

        [StringLength(1000)]
        public string? Description { get; set; }

        [StringLength(500)]
        public string? Remarks { get; set; }

        public DateTime? PaymentDate { get; set; }

        [StringLength(100)]
        public string? PaymentReference { get; set; }

        public int CreatedByUserId { get; set; }
        [ForeignKey("CreatedByUserId")]
        public User? CreatedByUser { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public int? ApprovedByUserId { get; set; }
        [ForeignKey("ApprovedByUserId")]
        public User? ApprovedByUser { get; set; }

        public DateTime? ApprovedDate { get; set; }

        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public ICollection<CommissionBreakdown>? CommissionBreakdowns { get; set; }
        public ICollection<CommissionDocument>? CommissionDocuments { get; set; }
    }

    public class CommissionBreakdown
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid CommissionId { get; set; }
        [ForeignKey("CommissionId")]
        public Commission? Commission { get; set; }

        [Required]
        [StringLength(100)]
        public required string ServiceType { get; set; } // AEPS, DMT, RECHARGE, etc.

        public int TransactionCount { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal TransactionVolume { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal CommissionRate { get; set; } // Percentage or fixed

        [Column(TypeName = "decimal(18, 2)")]
        public decimal CommissionAmount { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }
    }

    public class CommissionDocument
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid CommissionId { get; set; }
        [ForeignKey("CommissionId")]
        public Commission? Commission { get; set; }

        [Required]
        [StringLength(255)]
        public required string FileName { get; set; }

        [Required]
        [StringLength(500)]
        public required string FilePath { get; set; }

        [StringLength(100)]
        public string? FileType { get; set; }

        [StringLength(20)]
        public string DocumentType { get; set; } = "STATEMENT"; // STATEMENT, INVOICE, RECEIPT

        public long FileSize { get; set; }

        public int UploadedByUserId { get; set; }
        [ForeignKey("UploadedByUserId")]
        public User? UploadedByUser { get; set; }

        public DateTime UploadedDate { get; set; } = DateTime.UtcNow;
    }
}