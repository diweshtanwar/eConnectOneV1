using Microsoft.AspNetCore.Mvc;
using eConnectOne.API.Services.Tickets;
using eConnectOne.API.DTOs.Tickets;
using Microsoft.AspNetCore.Authorization;

namespace eConnectOne.API.Controllers.Tickets
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _ticketService;

        public TicketsController(ITicketService ticketService)
        {
            _ticketService = ticketService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetAllTickets()
        {
            var userId = GetCurrentUserId();
            var userRole = GetCurrentUserRole();
            var tickets = await _ticketService.GetAllTicketsAsync(userId, userRole);
            return Ok(tickets);
        }

        [HttpGet("by-type")]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetTicketsByType(
            [FromQuery] int typeId, 
            [FromQuery] bool includeClosed = false)
        {
            var tickets = await _ticketService.GetTicketsByTypeAsync(typeId, includeClosed);
            return Ok(tickets);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TicketDto>> GetTicketById(string id)
        {
            if (!Guid.TryParse(id, out var ticketId))
            {
                return BadRequest("Invalid ticket ID format");
            }
            
            var ticket = await _ticketService.GetTicketByIdAsync(ticketId);
            if (ticket == null)
            {
                return NotFound();
            }
            return Ok(ticket);
        }

        [HttpPost]
        public async Task<ActionResult<TicketDto>> CreateTicket([FromBody] TicketCreateDto ticketCreateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                var createdTicket = await _ticketService.CreateTicketAsync(ticketCreateDto, userId);
                return CreatedAtAction(nameof(GetTicketById), new { id = createdTicket.TicketId }, createdTicket);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating ticket: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Failed to create ticket", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<TicketDto>> UpdateTicket(string id, [FromBody] TicketUpdateDto ticketUpdateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!Guid.TryParse(id, out var ticketId))
            {
                return BadRequest("Invalid ticket ID format");
            }

            var userId = GetCurrentUserId();
            var updatedTicket = await _ticketService.UpdateTicketAsync(ticketId, ticketUpdateDto, userId);
            if (updatedTicket == null)
            {
                return NotFound();
            }

            return Ok(updatedTicket);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(string id)
        {
            if (!Guid.TryParse(id, out var ticketId))
            {
                return BadRequest("Invalid ticket ID format");
            }

            var userId = GetCurrentUserId();
            var result = await _ticketService.DeleteTicketAsync(ticketId, userId);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPut("{id}/status/{statusId}")]
        public async Task<IActionResult> UpdateTicketStatus(string id, int statusId)
        {
            if (!Guid.TryParse(id, out var ticketId))
            {
                return BadRequest("Invalid ticket ID format");
            }

            var userId = GetCurrentUserId();
            var result = await _ticketService.UpdateTicketStatusAsync(ticketId, statusId, userId);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPost("{id}/comment")]
        public async Task<IActionResult> AddCommentToTicket(string id, [FromBody] string comment)
        {
            if (!Guid.TryParse(id, out var ticketId))
            {
                return BadRequest("Invalid ticket ID format");
            }

            var userId = GetCurrentUserId();
            var result = await _ticketService.AddCommentToTicketAsync(ticketId, comment, userId);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }



        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 1; // Default to 1 if not found
        }

        private string GetCurrentUserRole()
        {
            return User.FindFirst("role")?.Value ?? "HO user";
        }
    }
}