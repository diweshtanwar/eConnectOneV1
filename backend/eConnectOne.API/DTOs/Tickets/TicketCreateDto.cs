using System;
using System.ComponentModel.DataAnnotations;

namespace eConnectOne.API.DTOs.Tickets
{
    public class TicketCreateDto
    {
        [Required]
        public int TypeId { get; set; } // Technical, Withdrawal, Deposit

        // These will be populated from the authenticated user, but can be overridden for specific scenarios
        public int? RaisedByUserId { get; set; }
        [StringLength(255)]
        public string? RequesterEmail { get; set; }
        [StringLength(20)]
        public string? RequesterMobile { get; set; }

        [Required]
        [StringLength(255)]
        public string Summary { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public int StatusId { get; set; } // Initial status, e.g., 'New', 'Pending'

        // Specific details for each type (only one should be provided)
        public TechnicalDetailCreateDto? TechnicalDetail { get; set; }
        public WithdrawalDetailCreateDto? WithdrawalDetail { get; set; }
        public DepositDetailCreateDto? DepositDetail { get; set; }
    }

    public class TechnicalDetailCreateDto
    {
        public int? ProblemTypeId { get; set; }
        [StringLength(255)]
        public string? AnyDeskDetail { get; set; }
    }

    public class WithdrawalDetailCreateDto
    {
        [Required]
        public decimal Amount { get; set; }
        [StringLength(100)]
        public string? Account { get; set; }
    }

    public class DepositDetailCreateDto
    {
        [Required]
        public decimal Amount { get; set; }
        public DateTime? DepositDate { get; set; }
    }
}
