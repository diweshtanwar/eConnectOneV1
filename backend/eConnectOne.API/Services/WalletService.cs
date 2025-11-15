using Microsoft.EntityFrameworkCore;
using eConnectOne.API.Data;
using eConnectOne.API.Models;

namespace eConnectOne.API.Services
{
    public interface IWalletService
    {
        Task<Wallet> EnsureWalletExistsAsync(int userId);
    }

    public class WalletService : IWalletService
    {
        private readonly ApplicationDbContext _context;

        public WalletService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Wallet> EnsureWalletExistsAsync(int userId)
        {
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null)
            {
                wallet = new Wallet 
                { 
                    UserId = userId,
                    Balance = 0,
                    PendingAmount = 0,
                    IsActive = true
                };
                
                _context.Wallets.Add(wallet);
                await _context.SaveChangesAsync();
            }

            return wallet;
        }
    }
}