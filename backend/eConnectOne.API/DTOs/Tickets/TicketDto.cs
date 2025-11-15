using System;
using System.Collections.Generic;

namespace eConnectOne.API.DTOs.Tickets
{
    public class TicketDto
    {
        public Guid TicketId { get; set; }
        public int TypeId { get; set; }
        public string? TypeName { get; set; } // From TicketType
        public int RaisedByUserId { get; set; }
        public string? RaisedByUsername { get; set; } // From User
        public string? RequesterEmail { get; set; }
        public string? RequesterMobile { get; set; }
        public string Summary { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int StatusId { get; set; }
        public string? StatusName { get; set; } // From TicketStatus
        public DateTime RequestedDate { get; set; }
        public DateTime? CompletionDate { get; set; }
        public string? ResolutionDetail { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedDate { get; set; }
        public string? CreatedByUsername { get; set; } // From User
        public DateTime? UpdatedDate { get; set; }
        public string? UpdatedByUsername { get; set; } // From User
        public bool IsDeleted { get; set; }

        // Specific details (only one will be populated based on TypeId)
        public TechnicalDetailDto? TechnicalDetail { get; set; }
        public WithdrawalDetailDto? WithdrawalDetail { get; set; }
        public DepositDetailDto? DepositDetail { get; set; }

        public ICollection<AttachmentDto>? Attachments { get; set; }
        public ICollection<TicketHistoryDto>? TicketHistory { get; set; }
    }

    public class TechnicalDetailDto
    {
        public int? ProblemTypeId { get; set; }
        public string? ProblemTypeName { get; set; } // From ProblemType
        public int? ResolutionProvidedByUserId { get; set; }
        public string? ResolutionProvidedByUsername { get; set; } // From User
        public string? AnyDeskDetail { get; set; }
    }

    public class WithdrawalDetailDto
    {
        public decimal Amount { get; set; }
        public string? Account { get; set; }
        public bool IsConfigured { get; set; }
        public bool IsMake { get; set; }
        public bool IsAuthorized { get; set; }
        public decimal? AuthorizedAmount { get; set; }
    }

    public class DepositDetailDto
    {
        public decimal Amount { get; set; }
        public DateTime? DepositDate { get; set; }
        public bool HasReceipt { get; set; }
        public string? ReceiptSource { get; set; }
        public bool IsVerified { get; set; }
    }

    public class AttachmentDto
    {
        public Guid AttachmentId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string? FileType { get; set; }
        public int UploadedByUserId { get; set; }
        public string? UploadedByUsername { get; set; } // From User
        public DateTime UploadedDate { get; set; }
    }

    public class TicketHistoryDto
    {
        public Guid HistoryId { get; set; }
        public string ChangeType { get; set; } = string.Empty;
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public int ChangedByUserId { get; set; }
        public string? ChangedByUsername { get; set; } // From User
        public DateTime ChangedDate { get; set; }
    }
}
