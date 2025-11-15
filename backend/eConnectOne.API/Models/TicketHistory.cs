using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace eConnectOne.API.Models
{
    public class TicketHistory
    {
        [Key]
        public Guid HistoryId { get; set; } = Guid.NewGuid();

        public Guid TicketId { get; set; }
        [ForeignKey("TicketId")]
        public Ticket? Ticket { get; set; }

        [Required]
        [StringLength(100)]
        public string ChangeType { get; set; }

        public string? OldValue { get; set; }

        public string? NewValue { get; set; }

        public int ChangedByUserId { get; set; }
        [ForeignKey("ChangedByUserId")]
        public User? ChangedByUser { get; set; }

        public DateTime ChangedDate { get; set; } = DateTime.UtcNow;
    }
}
