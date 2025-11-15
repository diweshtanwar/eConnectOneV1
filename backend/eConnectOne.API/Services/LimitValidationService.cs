using Microsoft.EntityFrameworkCore;
using eConnectOne.API.Data;
using eConnectOne.API.Models;

namespace eConnectOne.API.Services
{
    public interface ILimitValidationService
    {
        Task<LimitValidationResult> ValidateTransactionAsync(int userId, decimal amount, string transactionType);
        Task<UserLimit> GetOrCreateUserLimitAsync(int userId);
        Task<UserLimit> UpdateUserLimitsAsync(int userId, object limitsRequest);
    }

    public class LimitValidationService : ILimitValidationService
    {
        private readonly ApplicationDbContext _context;

        public LimitValidationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<LimitValidationResult> ValidateTransactionAsync(int userId, decimal amount, string transactionType)
        {
            var userLimit = await GetOrCreateUserLimitAsync(userId);
            var result = new LimitValidationResult { IsValid = true };

            if (transactionType.ToUpper() == "WITHDRAWAL")
            {
                // Check single transaction limit
                if (amount > userLimit.SingleTransactionLimit)
                {
                    result.IsValid = false;
                    result.Violations.Add($"Amount ₹{amount:N2} exceeds single transaction limit of ₹{userLimit.SingleTransactionLimit:N2}");
                }

                // Check daily limit
                var today = DateTime.Today;
                var todayWithdrawals = await _context.WalletTransactions
                    .Where(t => t.Wallet!.UserId == userId && 
                               t.TransactionType == "WITHDRAWAL" && 
                               t.CreatedDate >= today &&
                               t.Status == "COMPLETED")
                    .SumAsync(t => Math.Abs(t.Amount));

                if (todayWithdrawals + amount > userLimit.DailyWithdrawalLimit)
                {
                    result.IsValid = false;
                    result.Violations.Add($"Daily withdrawal limit exceeded. Used: ₹{todayWithdrawals:N2}, Limit: ₹{userLimit.DailyWithdrawalLimit:N2}");
                }

                // Check daily transaction count
                var todayTransactionCount = await _context.WalletTransactions
                    .Where(t => t.Wallet!.UserId == userId && 
                               t.CreatedDate >= today &&
                               t.Status == "COMPLETED")
                    .CountAsync();

                if (todayTransactionCount >= userLimit.DailyTransactionCount)
                {
                    result.IsValid = false;
                    result.Violations.Add($"Daily transaction count limit exceeded. Count: {todayTransactionCount}, Limit: {userLimit.DailyTransactionCount}");
                }

                // Check negative balance limit
                var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
                if (wallet != null)
                {
                    var newBalance = wallet.Balance - amount;
                    if (newBalance < userLimit.MinimumBalance)
                    {
                        result.IsValid = false;
                        result.Violations.Add($"Transaction would exceed negative balance limit. New balance: ₹{newBalance:N2}, Minimum allowed: ₹{userLimit.MinimumBalance:N2}");
                        result.RequiresApproval = true;
                    }
                }

                // Check if requires approval
                if (amount > userLimit.ApprovalThreshold)
                {
                    result.RequiresApproval = true;
                    result.ApprovalReason = $"Amount exceeds approval threshold of ₹{userLimit.ApprovalThreshold:N2}";
                }
            }

            return result;
        }

        public async Task<UserLimit> GetOrCreateUserLimitAsync(int userId)
        {
            var userLimit = await _context.UserLimits
                .FirstOrDefaultAsync(ul => ul.UserId == userId);

            if (userLimit == null)
            {
                // Create default limits based on user role
                var user = await _context.Users
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                userLimit = new UserLimit
                {
                    UserId = userId,
                    DailyWithdrawalLimit = user?.Role?.Name == "CSP" ? 25000 : 50000,
                    MonthlyWithdrawalLimit = user?.Role?.Name == "CSP" ? 250000 : 500000,
                    SingleTransactionLimit = user?.Role?.Name == "CSP" ? 10000 : 25000,
                    DailyTransactionCount = user?.Role?.Name == "CSP" ? 5 : 10,
                    MinimumBalance = user?.Role?.Name == "CSP" ? -5000 : -10000, // Negative balance limit
                    ApprovalThreshold = user?.Role?.Name == "CSP" ? 5000 : 10000,
                    RequireApprovalAbove = true
                };

                _context.UserLimits.Add(userLimit);
                await _context.SaveChangesAsync();
            }

            return userLimit;
        }

        public async Task<UserLimit> UpdateUserLimitsAsync(int userId, object limitsRequest)
        {
            var userLimit = await GetOrCreateUserLimitAsync(userId);
            
            // Use reflection to update properties from the request object
            var requestType = limitsRequest.GetType();
            var dailyLimit = requestType.GetProperty("DailyWithdrawalLimit")?.GetValue(limitsRequest);
            var monthlyLimit = requestType.GetProperty("MonthlyWithdrawalLimit")?.GetValue(limitsRequest);
            var singleLimit = requestType.GetProperty("SingleTransactionLimit")?.GetValue(limitsRequest);
            var minBalance = requestType.GetProperty("MinimumBalance")?.GetValue(limitsRequest);
            
            if (dailyLimit != null) userLimit.DailyWithdrawalLimit = (decimal)dailyLimit;
            if (monthlyLimit != null) userLimit.MonthlyWithdrawalLimit = (decimal)monthlyLimit;
            if (singleLimit != null) userLimit.SingleTransactionLimit = (decimal)singleLimit;
            if (minBalance != null) userLimit.MinimumBalance = (decimal)minBalance;
            
            userLimit.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            return userLimit;
        }
    }

    public class LimitValidationResult
    {
        public bool IsValid { get; set; }
        public bool RequiresApproval { get; set; }
        public string? ApprovalReason { get; set; }
        public List<string> Violations { get; set; } = new();
    }
}