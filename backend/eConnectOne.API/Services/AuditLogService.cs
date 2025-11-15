using eConnectOne.API.Data;
using eConnectOne.API.Models;
using eConnectOne.API.DTOs;
using Microsoft.EntityFrameworkCore;

    public interface IEnhancedAuditLogService
    {
        Task LogAsync(string action, string entityType, string entityId, object? oldValue, object? newValue, int userId, string? ipAddress = null);
        Task LogSecurityEventAsync(string eventType, string description, int? userId, string? ipAddress, string? userAgent);
        Task<bool> CleanAuditLogsBeforeDateAsync(DateTime cutoffDate);
    }

    public class EnhancedAuditLogService : IEnhancedAuditLogService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<EnhancedAuditLogService> _logger;

        public EnhancedAuditLogService(ApplicationDbContext context, ILogger<EnhancedAuditLogService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task LogAsync(string action, string entityType, string entityId, object? oldValue, object? newValue, int userId, string? ipAddress = null)
        {
            try
            {
                var auditLog = new AuditLog
                {
                    Action = action,
                    EntityType = entityType,
                    EntityId = entityId,
                    OldValue = oldValue != null ? System.Text.Json.JsonSerializer.Serialize(oldValue) : null,
                    NewValue = newValue != null ? System.Text.Json.JsonSerializer.Serialize(newValue) : null,
                    UserId = userId,
                    IpAddress = ipAddress,
                    Timestamp = DateTime.UtcNow
                };

                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to write audit log for {Action} on {EntityType}", action, entityType);
            }
        }

        public async Task LogSecurityEventAsync(string eventType, string description, int? userId, string? ipAddress, string? userAgent)
        {
            try
            {
                var securityLog = new SecurityLog
                {
                    EventType = eventType,
                    Description = description,
                    UserId = userId,
                    IpAddress = ipAddress,
                    UserAgent = userAgent,
                    Timestamp = DateTime.UtcNow
                };

                _context.SecurityLogs.Add(securityLog);
                await _context.SaveChangesAsync();

                _logger.LogWarning("Security Event: {EventType} - {Description} - User: {UserId} - IP: {IpAddress}",
                    eventType, description, userId, ipAddress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to write security log for {EventType}", eventType);
            }
        }

        public async Task<bool> CleanAuditLogsBeforeDateAsync(DateTime cutoffDate)
        {
            try
            {
                var oldLogs = _context.AuditLogs.Where(l => l.Timestamp < cutoffDate);
                _context.AuditLogs.RemoveRange(oldLogs);
                var count = await _context.SaveChangesAsync();
                return count > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to clean audit logs before {CutoffDate}", cutoffDate);
                return false;
            }
        }
    }
// Duplicate class removed. Only one EnhancedAuditLogService remains, implementing all required methods.