using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using eConnectOne.API.Services;
using System.Security.Claims;

namespace eConnectOne.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Master Admin,Admin,HO User")]
    public class RiskManagementController : ControllerBase
    {
        private readonly IFraudDetectionService _fraudDetectionService;
        private readonly ILimitValidationService _limitValidationService;

        public RiskManagementController(
            IFraudDetectionService fraudDetectionService,
            ILimitValidationService limitValidationService)
        {
            _fraudDetectionService = fraudDetectionService;
            _limitValidationService = limitValidationService;
        }

        [HttpGet("alerts")]
        public async Task<ActionResult> GetRiskAlerts()
        {
            var alerts = await _fraudDetectionService.GetActiveAlertsAsync();
            return Ok(alerts);
        }

        [HttpGet("assess/{ticketId}")]
        public async Task<ActionResult> AssessRisk(string ticketId)
        {
            if (!Guid.TryParse(ticketId, out var id))
                return BadRequest("Invalid ticket ID");

            var assessment = await _fraudDetectionService.AssessTransactionRiskAsync(id);
            return Ok(assessment);
        }

        [HttpGet("limits/{userId}")]
        public async Task<ActionResult> GetUserLimits(int userId)
        {
            var limits = await _limitValidationService.GetOrCreateUserLimitAsync(userId);
            return Ok(limits);
        }

        [HttpPost("validate")]
        public async Task<ActionResult> ValidateTransaction([FromBody] ValidationRequest request)
        {
            var result = await _limitValidationService.ValidateTransactionAsync(
                request.UserId, request.Amount, request.TransactionType);
            return Ok(result);
        }

        [HttpPut("limits/{userId}")]
        [Authorize(Roles = "Master Admin")]
        public async Task<ActionResult> UpdateUserLimits(int userId, [FromBody] UpdateLimitsRequest request)
        {
            var result = await _limitValidationService.UpdateUserLimitsAsync(userId, request);
            return Ok(result);
        }
    }

    public class ValidationRequest
    {
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public required string TransactionType { get; set; }
    }

    public class UpdateLimitsRequest
    {
        public decimal DailyWithdrawalLimit { get; set; }
        public decimal MonthlyWithdrawalLimit { get; set; }
        public decimal SingleTransactionLimit { get; set; }
        public decimal MinimumBalance { get; set; }
    }
}