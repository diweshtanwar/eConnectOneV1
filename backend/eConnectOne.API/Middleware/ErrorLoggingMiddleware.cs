using System;
using System.Net;
using System.Text.Json;
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
                var traceId = context.TraceIdentifier;
                _logger.LogError(ex, "Unhandled exception occurred. TraceId: {TraceId}", traceId);

                var userId = context.User?.Identity?.IsAuthenticated == true ? int.Parse(context.User.FindFirst("id")?.Value ?? "0") : (int?)null;
                var ip = context.Connection.RemoteIpAddress?.ToString();
                await auditLogService.LogAsync(
                    action: "Exception",
                    entityType: "Global",
                    entityId: "0",
                    oldValue: null,
                    newValue: ex.ToString(),
                    userId: userId ?? 0,
                    ipAddress: ip
                );

                // If the response has already started (e.g. streaming was in progress),
                // we can't modify the status code/headers/body — just log and rethrow.
                if (context.Response.HasStarted)
                {
                    throw;
                }

                context.Response.Clear();
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                context.Response.ContentType = "application/json";

                // Return a structured, non-leaking error body. The traceId lets the caller
                // correlate the failure with server-side logs without exposing exception
                // details (stack traces, connection strings, etc.) to the client.
                var payload = JsonSerializer.Serialize(new
                {
                    message = "An unexpected error occurred. Please try again or contact your system administrator.",
                    traceId
                });
                await context.Response.WriteAsync(payload);
            }
        }
    }
}
