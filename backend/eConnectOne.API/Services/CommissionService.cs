using Microsoft.EntityFrameworkCore;
using eConnectOne.API.Data;
using eConnectOne.API.Models;

namespace eConnectOne.API.Services
{
    public interface ICommissionService
    {
        Task<Commission> CreateCommissionAsync(Commission commission, List<CommissionBreakdown> breakdowns);
        Task<List<Commission>> GetCommissionsAsync(int? cspUserId = null, int? year = null);
        Task<Commission?> GetCommissionAsync(Guid commissionId, int? cspUserId = null);
        Task<Commission> UpdateCommissionAsync(Commission commission);
        Task<bool> DeleteCommissionAsync(Guid commissionId);
        Task<Commission?> UpdateCommissionStatusAsync(Guid commissionId, string status, int updatedByUserId, string? remarks = null);
    }

    public class CommissionService : ICommissionService
    {
        private readonly ApplicationDbContext _context;

        public CommissionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Commission> CreateCommissionAsync(Commission commission, List<CommissionBreakdown> breakdowns)
        {
            // Calculate totals
            commission.TotalCommission = commission.BaseCommission + commission.BonusCommission - commission.Deductions;
            commission.NetPayable = commission.TotalCommission - commission.TaxDeducted;

            _context.Commissions.Add(commission);
            
            foreach (var breakdown in breakdowns)
            {
                breakdown.CommissionId = commission.CommissionId;
                _context.CommissionBreakdowns.Add(breakdown);
            }

            await _context.SaveChangesAsync();
            return commission;
        }

        public async Task<List<Commission>> GetCommissionsAsync(int? cspUserId = null, int? year = null)
        {
            var query = _context.Commissions
                .Include(c => c.CSPUser)
                .Include(c => c.CreatedByUser)
                .Include(c => c.ApprovedByUser)
                .Include(c => c.CommissionBreakdowns)
                .Where(c => !c.IsDeleted);

            if (cspUserId.HasValue)
                query = query.Where(c => c.CSPUserId == cspUserId.Value);

            if (year.HasValue)
                query = query.Where(c => c.Year == year.Value);

            return await query.OrderByDescending(c => c.Year)
                            .ThenByDescending(c => c.Month)
                            .ToListAsync();
        }

        public async Task<Commission?> GetCommissionAsync(Guid commissionId, int? cspUserId = null)
        {
            var query = _context.Commissions
                .Include(c => c.CSPUser)
                .Include(c => c.CreatedByUser)
                .Include(c => c.ApprovedByUser)
                .Include(c => c.CommissionBreakdowns)
                .Include(c => c.CommissionDocuments)
                .Where(c => c.CommissionId == commissionId && !c.IsDeleted);

            if (cspUserId.HasValue)
                query = query.Where(c => c.CSPUserId == cspUserId.Value);

            return await query.FirstOrDefaultAsync();
        }

        public async Task<Commission> UpdateCommissionAsync(Commission commission)
        {
            _context.Commissions.Update(commission);
            await _context.SaveChangesAsync();
            return commission;
        }

        public async Task<bool> DeleteCommissionAsync(Guid commissionId)
        {
            var commission = await _context.Commissions
                .FirstOrDefaultAsync(c => c.CommissionId == commissionId && !c.IsDeleted);

            if (commission == null) return false;

            commission.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Commission?> UpdateCommissionStatusAsync(Guid commissionId, string status, int updatedByUserId, string? remarks = null)
        {
            var commission = await _context.Commissions
                .FirstOrDefaultAsync(c => c.CommissionId == commissionId && !c.IsDeleted);

            if (commission == null) return null;

            commission.Status = status;
            commission.Remarks = remarks;

            if (status == "APPROVED")
            {
                commission.ApprovedByUserId = updatedByUserId;
                commission.ApprovedDate = DateTime.UtcNow;
            }
            else if (status == "PAID")
            {
                commission.PaymentDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return commission;
        }
    }
}