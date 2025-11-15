using eConnectOne.API.Data;
using eConnectOne.API.DTOs.Tickets;
using eConnectOne.API.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;

namespace eConnectOne.API.Services.Tickets
{
    public class AttachmentService : IAttachmentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public AttachmentService(ApplicationDbContext context, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task<AttachmentDto?> UploadAttachmentAsync(AttachmentUploadDto uploadDto, int uploadedByUserId)
        {
            var ticketExists = await _context.Tickets.AnyAsync(t => t.TicketId == uploadDto.TicketId && !t.IsDeleted);
            if (!ticketExists)
            {
                return null; // Ticket not found or is deleted
            }

            var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "attachments");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + uploadDto.File.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await uploadDto.File.CopyToAsync(fileStream);
            }

            var attachment = new Attachment
            {
                TicketId = uploadDto.TicketId,
                FileName = uploadDto.File.FileName,
                FilePath = "/attachments/" + uniqueFileName, // Stored as a relative URL
                FileType = uploadDto.File.ContentType,
                UploadedByUserId = uploadedByUserId,
                UploadedDate = DateTime.UtcNow
            };

            _context.Attachments.Add(attachment);

            // Log attachment addition in TicketHistory
            _context.TicketHistory.Add(new TicketHistory
            {
                TicketId = uploadDto.TicketId,
                ChangeType = "Attachment Added",
                OldValue = null,
                NewValue = $"File: {attachment.FileName}, Path: {attachment.FilePath}",
                ChangedByUserId = uploadedByUserId,
                ChangedDate = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return new AttachmentDto
            {
                AttachmentId = attachment.AttachmentId,
                FileName = attachment.FileName,
                FilePath = attachment.FilePath,
                FileType = attachment.FileType,
                UploadedByUserId = attachment.UploadedByUserId,
                UploadedDate = attachment.UploadedDate
            };
        }

        public async Task<bool> DeleteAttachmentAsync(Guid attachmentId)
        {
            var attachment = await _context.Attachments.FirstOrDefaultAsync(a => a.AttachmentId == attachmentId);
            if (attachment == null) return false;

            // Delete file from file system
            var fullPath = Path.Combine(_webHostEnvironment.WebRootPath, attachment.FilePath.TrimStart('/'));
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }

            _context.Attachments.Remove(attachment);

            // Log attachment deletion in TicketHistory
            _context.TicketHistory.Add(new TicketHistory
            {
                TicketId = attachment.TicketId,
                ChangeType = "Attachment Deleted",
                OldValue = $"File: {attachment.FileName}, Path: {attachment.FilePath}",
                NewValue = null,
                ChangedByUserId = attachment.UploadedByUserId, // Assuming the uploader is the deleter for simplicity
                ChangedDate = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<AttachmentDto>> GetAttachmentsByTicketIdAsync(Guid ticketId)
        {
            var attachments = await _context.Attachments
                .Where(a => a.TicketId == ticketId)
                .Include(a => a.UploadedByUser)
                .ToListAsync();

            return attachments.Select(a => new AttachmentDto
            {
                AttachmentId = a.AttachmentId,
                FileName = a.FileName,
                FilePath = a.FilePath,
                FileType = a.FileType,
                UploadedByUserId = a.UploadedByUserId,
                UploadedByUsername = a.UploadedByUser?.Username,
                UploadedDate = a.UploadedDate
            });
        }

        public async Task<AttachmentDto?> GetAttachmentByIdAsync(Guid attachmentId)
        {
            var attachment = await _context.Attachments
                .Include(a => a.UploadedByUser)
                .FirstOrDefaultAsync(a => a.AttachmentId == attachmentId);

            if (attachment == null) return null;

            return new AttachmentDto
            {
                AttachmentId = attachment.AttachmentId,
                FileName = attachment.FileName,
                FilePath = attachment.FilePath,
                FileType = attachment.FileType,
                UploadedByUserId = attachment.UploadedByUserId,
                UploadedByUsername = attachment.UploadedByUser?.Username,
                UploadedDate = attachment.UploadedDate
            };
        }

        public async Task<bool> UserHasAccessToAttachmentAsync(Guid attachmentId, int userId)
        {
            // Check if user has access to the ticket that owns this attachment
            var hasAccess = await _context.Attachments
                .Include(a => a.Ticket)
                .Where(a => a.AttachmentId == attachmentId)
                .AnyAsync(a => a.Ticket.RaisedByUserId == userId || 
                              a.Ticket.CreatedByUserId == userId || 
                              a.UploadedByUserId == userId);

            return hasAccess;
        }
    }
}
