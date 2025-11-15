using eConnectOne.API.DTOs;
using eConnectOne.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eConnectOne.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;

        public AuditLogsController(IAuditLogService auditLogService)
        {
            _auditLogService = auditLogService;
        }

        // GET: api/AuditLogs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetAllAuditLogs()
        {
            var logs = await _auditLogService.GetAllAuditLogsAsync();
            return Ok(logs);
        }

        // GET: api/AuditLogs/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AuditLogDto>> GetAuditLog(int id)
        {
            var log = await _auditLogService.GetAuditLogByIdAsync(id);
            if (log == null)
            {
                return NotFound();
            }
            return Ok(log);
        }

        // POST: api/AuditLogs/clean
        [HttpPost("clean")]
        public async Task<IActionResult> CleanAuditLogs([FromQuery] DateTime cutoffDate)
        {
            try
            {
                var result = await _auditLogService.CleanAuditLogsBeforeDateAsync(cutoffDate);
                if (result)
                {
                    return Ok("Audit logs cleaned successfully.");
                }
                return Ok("No audit logs found to clean before the specified date.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while cleaning audit logs.");
            }
        }
    }
}