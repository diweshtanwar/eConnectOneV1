using eConnectOne.API.DTOs.Tickets;
using eConnectOne.API.Services.Tickets;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.StaticFiles; // For GetContentType

namespace eConnectOne.API.Controllers.Tickets
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AttachmentsController : ControllerBase
    {
        private readonly IAttachmentService _attachmentService;

        public AttachmentsController(IAttachmentService attachmentService)
        {
            _attachmentService = attachmentService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token.");
            }
            return userId;
        }

        [HttpPost("upload")]
        public async Task<ActionResult<AttachmentDto>> Upload([FromForm] AttachmentUploadDto uploadDto)
        {
            try
            {
                var uploadedByUserId = GetCurrentUserId();
                var attachment = await _attachmentService.UploadAttachmentAsync(uploadDto, uploadedByUserId);
                if (attachment == null)
                {
                    return BadRequest("Failed to upload attachment or ticket not found.");
                }
                return Ok(attachment);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("ticket/{ticketId}")]
        public async Task<ActionResult<IEnumerable<AttachmentDto>>> GetAttachmentsByTicketId(Guid ticketId)
        {
            var attachments = await _attachmentService.GetAttachmentsByTicketIdAsync(ticketId);
            return Ok(attachments);
        }

        [HttpDelete("{attachmentId}")]
        public async Task<IActionResult> DeleteAttachment(Guid attachmentId)
        {
            var result = await _attachmentService.DeleteAttachmentAsync(attachmentId);
            if (!result)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpGet("download/{attachmentId}")]
        public async Task<IActionResult> DownloadAttachment(Guid attachmentId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var attachment = await _attachmentService.GetAttachmentByIdAsync(attachmentId);

                if (attachment == null)
                {
                    return NotFound("Attachment not found");
                }

                // Security: Verify user has access to this ticket's attachments
                var hasAccess = await _attachmentService.UserHasAccessToAttachmentAsync(attachmentId, userId);
                if (!hasAccess)
                {
                    return Forbid("Access denied to this attachment");
                }

                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", attachment.FilePath.TrimStart('/'));

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound("File not found on server");
                }

                var provider = new FileExtensionContentTypeProvider();
                if (!provider.TryGetContentType(filePath, out var contentType))
                {
                    contentType = "application/octet-stream";
                }

                // Return file as stream to prevent direct path exposure
                var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                return File(fileBytes, contentType, attachment.FileName);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized("Authentication required");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error downloading file: {ex.Message}");
            }
        }
    }
}
