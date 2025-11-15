using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using eConnectOne.API.Services;

namespace eConnectOne.API.Middleware
{
    public class ErrorLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorLoggingMiddleware> _logger;

        public ErrorLoggingMiddleware(RequestDelegate next, ILogger<ErrorLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, IEnhancedAuditLogService auditLogService)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred");
                var userId = context.User?.Identity?.IsAuthenticated == true ? int.Parse(context.User.FindFirst("id")?.Value ?? "0") : (int?)null;
                var ip = context.Connection.RemoteIpAddress?.ToString();
                await auditLogService.LogAsync(
                    action: "Exception",
                    entityType: "Global",
                    entityId: null,
                    oldValue: null,
                    newValue: ex.ToString(),
                    userId: userId ?? 0,
                    ipAddress: ip
                );
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                await context.Response.WriteAsync("An unexpected error occurred.");
            }
        }
    }
}
