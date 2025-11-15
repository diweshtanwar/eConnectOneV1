using Microsoft.EntityFrameworkCore;
using eConnectOne.API.Data;
using eConnectOne.API.Models;

namespace eConnectOne.API.Services
{
    public interface IReconciliationService
    {
        Task<ReconciliationResult> ReconcileWalletAsync(Guid walletId);
        Task<List<ReconciliationResult>> ReconcileAllWalletsAsync();
    }

    public class ReconciliationService : IReconciliationService
    {
        private readonly ApplicationDbContext _context;

        public ReconciliationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ReconciliationResult> ReconcileWalletAsync(Guid walletId)
        {
            var wallet = await _context.Wallets
                .Include(w => w.Transactions)
                .FirstOrDefaultAsync(w => w.WalletId == walletId);

            if (wallet == null)
                return new ReconciliationResult { WalletId = walletId, Status = "NOT_FOUND" };

            var calculatedBalance = wallet.Transactions?
                .Where(t => t.Status == "COMPLETED")
                .Sum(t => t.Amount) ?? 0;

            var difference = wallet.Balance - calculatedBalance;
            var status = Math.Abs(difference) < 0.01m ? "MATCHED" : "MISMATCH";

            return new ReconciliationResult
            {
                WalletId = walletId,
                UserId = wallet.UserId,
                RecordedBalance = wallet.Balance,
                CalculatedBalance = calculatedBalance,
                Difference = difference,
                Status = status,
                TransactionCount = wallet.Transactions?.Count ?? 0,
                CheckedAt = DateTime.UtcNow
            };
        }

        public async Task<List<ReconciliationResult>> ReconcileAllWalletsAsync()
        {
            var wallets = await _context.Wallets.ToListAsync();
            var results = new List<ReconciliationResult>();

            foreach (var wallet in wallets)
            {
                var result = await ReconcileWalletAsync(wallet.WalletId);
                results.Add(result);
            }

            return results;
        }
    }

    public class ReconciliationResult
    {
        public Guid WalletId { get; set; }
        public int UserId { get; set; }
        public decimal RecordedBalance { get; set; }
        public decimal CalculatedBalance { get; set; }
        public decimal Difference { get; set; }
        public string Status { get; set; } = "UNKNOWN";
        public int TransactionCount { get; set; }
        public DateTime CheckedAt { get; set; }
    }
}