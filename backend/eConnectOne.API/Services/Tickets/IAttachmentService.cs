using eConnectOne.API.DTOs.Tickets;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace eConnectOne.API.Services.Tickets
{
    public interface IAttachmentService
    {
        Task<AttachmentDto?> UploadAttachmentAsync(AttachmentUploadDto uploadDto, int uploadedByUserId);
        Task<bool> DeleteAttachmentAsync(Guid attachmentId);
        Task<IEnumerable<AttachmentDto>> GetAttachmentsByTicketIdAsync(Guid ticketId);
        Task<AttachmentDto?> GetAttachmentByIdAsync(Guid attachmentId);
        Task<bool> UserHasAccessToAttachmentAsync(Guid attachmentId, int userId);
    }
}
