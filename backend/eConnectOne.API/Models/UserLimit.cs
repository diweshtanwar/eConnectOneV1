using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace eConnectOne.API.Models
{
    public class UserLimit
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Column(TypeName = "decimal(18, 2)")]
        public decimal DailyWithdrawalLimit { get; set; } = 50000;

        [Column(TypeName = "decimal(18, 2)")]
        public decimal MonthlyWithdrawalLimit { get; set; } = 500000;

        [Column(TypeName = "decimal(18, 2)")]
        public decimal SingleTransactionLimit { get; set; } = 25000;

        public int DailyTransactionCount { get; set; } = 10;

        [Column(TypeName = "decimal(18, 2)")]
        public decimal MinimumBalance { get; set; } = -10000; // Allowed negative balance

        public bool RequireApprovalAbove { get; set; } = true;
        
        [Column(TypeName = "decimal(18, 2)")]
        public decimal ApprovalThreshold { get; set; } = 10000;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }
    }
}