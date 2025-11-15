using Microsoft.EntityFrameworkCore;
using eConnectOne.API.Data;
using eConnectOne.API.Models;

namespace eConnectOne.API.Services
{
    public interface IFraudDetectionService
    {
        Task<RiskAssessment> AssessTransactionRiskAsync(Guid ticketId);
        Task<List<RiskAlert>> GetActiveAlertsAsync();
    }

    public class FraudDetectionService : IFraudDetectionService
    {
        private readonly ApplicationDbContext _context;

        public FraudDetectionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<RiskAssessment> AssessTransactionRiskAsync(Guid ticketId)
        {
            var ticket = await _context.Tickets
                .Include(t => t.WithdrawalDetail)
                .Include(t => t.DepositDetail)
                .Include(t => t.RaisedByUser)
                .FirstOrDefaultAsync(t => t.TicketId == ticketId);

            if (ticket == null)
                return new RiskAssessment { TicketId = ticketId, RiskLevel = "UNKNOWN" };

            var amount = ticket.WithdrawalDetail?.Amount ?? ticket.DepositDetail?.Amount ?? 0;
            var userId = ticket.RaisedByUserId;
            
            var riskScore = 0;
            var riskFactors = new List<string>();

            // Check transaction frequency (last 24 hours)
            var recentTransactions = await _context.Tickets
                .Where(t => t.RaisedByUserId == userId && 
                           t.CreatedDate >= DateTime.UtcNow.AddHours(-24))
                .CountAsync();

            if (recentTransactions > 5)
            {
                riskScore += 30;
                riskFactors.Add("High frequency transactions");
            }

            // Check amount patterns
            if (amount > 50000)
            {
                riskScore += 25;
                riskFactors.Add("Large amount transaction");
            }

            // Check for round numbers (potential fraud indicator)
            if (amount % 1000 == 0 && amount > 10000)
            {
                riskScore += 15;
                riskFactors.Add("Round number amount");
            }

            // Check time patterns (transactions outside business hours)
            var hour = DateTime.Now.Hour;
            if (hour < 9 || hour > 18)
            {
                riskScore += 10;
                riskFactors.Add("Outside business hours");
            }

            // Check user history
            var userTransactionCount = await _context.Tickets
                .Where(t => t.RaisedByUserId == userId)
                .CountAsync();

            if (userTransactionCount < 5)
            {
                riskScore += 20;
                riskFactors.Add("New user with limited history");
            }

            var riskLevel = riskScore switch
            {
                >= 70 => "CRITICAL",
                >= 50 => "HIGH", 
                >= 30 => "MEDIUM",
                _ => "LOW"
            };

            return new RiskAssessment
            {
                TicketId = ticketId,
                UserId = userId,
                Amount = amount,
                RiskScore = riskScore,
                RiskLevel = riskLevel,
                RiskFactors = riskFactors,
                RequiresManualReview = riskScore >= 50,
                AssessedAt = DateTime.UtcNow
            };
        }

        public async Task<List<RiskAlert>> GetActiveAlertsAsync()
        {
            // This would typically query a RiskAlerts table
            // For now, return high-risk pending transactions
            var highRiskTickets = await _context.Tickets
                .Where(t => t.StatusId == 1 && t.PriorityScore >= 80)
                .Select(t => new RiskAlert
                {
                    TicketId = t.TicketId,
                    UserId = t.RaisedByUserId,
                    AlertType = "HIGH_RISK_TRANSACTION",
                    Message = $"High-risk transaction detected: ₹{(t.WithdrawalDetail != null ? t.WithdrawalDetail.Amount : t.DepositDetail!.Amount):N2}",
                    CreatedAt = t.CreatedDate
                })
                .ToListAsync();

            return highRiskTickets;
        }
    }

    public class RiskAssessment
    {
        public Guid TicketId { get; set; }
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public int RiskScore { get; set; }
        public string RiskLevel { get; set; } = "LOW";
        public List<string> RiskFactors { get; set; } = new();
        public bool RequiresManualReview { get; set; }
        public DateTime AssessedAt { get; set; }
    }

    public class RiskAlert
    {
        public Guid TicketId { get; set; }
        public int UserId { get; set; }
        public string AlertType { get; set; } = "";
        public string Message { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }
}