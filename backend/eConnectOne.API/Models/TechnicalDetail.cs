using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace eConnectOne.API.Models
{
    public class TechnicalDetail
    {
        [Key]
        public Guid TicketId { get; set; }

        [ForeignKey("TicketId")]
        public Ticket? Ticket { get; set; }

        public int? ProblemTypeId { get; set; }
        [ForeignKey("ProblemTypeId")]
        public ProblemType? ProblemType { get; set; }

        public int? ResolutionProvidedByUserId { get; set; }
        [ForeignKey("ResolutionProvidedByUserId")]
        public User? ResolutionProvidedByUser { get; set; }

        [StringLength(255)]
        public string? AnyDeskDetail { get; set; }
    }
}
