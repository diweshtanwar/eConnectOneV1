using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using eConnectOne.API.Data;

namespace eConnectOne.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Master Admin,Admin")]
    public class AnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnalyticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<ActionResult> GetDashboardAnalytics()
        {
            var totalTransactions = await _context.WalletTransactions.CountAsync();
            var totalVolume = await _context.WalletTransactions
                .Where(t => t.Status == "COMPLETED")
                .SumAsync(t => Math.Abs(t.Amount));
            
            var withdrawalCount = await _context.WalletTransactions
                .Where(t => t.TransactionType == "WITHDRAWAL" && t.Status == "COMPLETED")
                .CountAsync();
            
            var depositCount = await _context.WalletTransactions
                .Where(t => t.TransactionType == "DEPOSIT" && t.Status == "COMPLETED")
                .CountAsync();

            var avgTransactionAmount = totalTransactions > 0 ? totalVolume / totalTransactions : 0;

            var topUsers = await _context.WalletTransactions
                .Include(t => t.Wallet)
                .ThenInclude(w => w.User)
                .Where(t => t.Status == "COMPLETED")
                .GroupBy(t => new { t.Wallet!.UserId, t.Wallet.User!.Username })
                .Select(g => new {
                    UserId = g.Key.UserId,
                    Username = g.Key.Username,
                    TotalAmount = g.Sum(t => Math.Abs(t.Amount))
                })
                .OrderByDescending(x => x.TotalAmount)
                .Take(5)
                .ToListAsync();

            return Ok(new {
                totalTransactions,
                totalVolume,
                withdrawalCount,
                depositCount,
                avgTransactionAmount,
                topUsers
            });
        }
    }
}