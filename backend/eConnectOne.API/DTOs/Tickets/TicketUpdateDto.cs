using System;
using System.ComponentModel.DataAnnotations;

namespace eConnectOne.API.DTOs.Tickets
{
    public class TicketUpdateDto
    {
        [Required]
        public Guid TicketId { get; set; }

        [StringLength(255)]
        public string? Summary { get; set; }

        public string? Description { get; set; }

        public int? StatusId { get; set; }

        public DateTime? CompletionDate { get; set; }

        public string? ResolutionDetail { get; set; }

        public string? Comment { get; set; }

        public bool? IsDeleted { get; set; }

        // Specific details for each type that can be updated
        public TechnicalDetailUpdateDto? TechnicalDetail { get; set; }
        public WithdrawalDetailUpdateDto? WithdrawalDetail { get; set; }
        public DepositDetailUpdateDto? DepositDetail { get; set; }
    }

    public class TechnicalDetailUpdateDto
    {
        public int? ProblemTypeId { get; set; }
        public int? ResolutionProvidedByUserId { get; set; }
        [StringLength(255)]
        public string? AnyDeskDetail { get; set; }
    }

    public class WithdrawalDetailUpdateDto
    {
        public decimal? Amount { get; set; }
        [StringLength(100)]
        public string? Account { get; set; }
        public bool? IsConfigured { get; set; }
        public bool? IsMake { get; set; }
        public bool? IsAuthorized { get; set; }
        public decimal? AuthorizedAmount { get; set; }
    }

    public class DepositDetailUpdateDto
    {
        public decimal? Amount { get; set; }
        public DateTime? DepositDate { get; set; }
        public bool? HasReceipt { get; set; }
        public string? ReceiptSource { get; set; }
        public bool? IsVerified { get; set; }
    }
}
