using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http; // For IFormFile

namespace eConnectOne.API.DTOs.Tickets
{
    public class AttachmentUploadDto
    {
        [Required]
        public Guid TicketId { get; set; }

        [Required]
        public IFormFile File { get; set; } = default!;

        [StringLength(50)]
        public string? FileType { get; set; }
    }
}
