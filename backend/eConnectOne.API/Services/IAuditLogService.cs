using eConnectOne.API.DTOs;

namespace eConnectOne.API.Services
{
    public interface IAuditLogService
    {
        Task<IEnumerable<AuditLogDto>> GetAllAuditLogsAsync();
        Task<AuditLogDto?> GetAuditLogByIdAsync(int id);
        Task<bool> CleanAuditLogsBeforeDateAsync(DateTime cutoffDate);
    }
}