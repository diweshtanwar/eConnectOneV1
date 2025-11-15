using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using eConnectOne.API.Data;

namespace eConnectOne.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var withdrawalStats = await _context.Tickets
                    .Where(t => t.TypeId == 2 && !t.IsDeleted)
                    .GroupBy(t => t.StatusId)
                    .Select(g => new { StatusId = g.Key, Count = g.Count() })
                    .ToListAsync();

                var depositStats = await _context.Tickets
                    .Where(t => t.TypeId == 3 && !t.IsDeleted)
                    .GroupBy(t => t.StatusId)
                    .Select(g => new { StatusId = g.Key, Count = g.Count() })
                    .ToListAsync();

                var supportStats = await _context.Tickets
                    .Where(t => t.TypeId == 1 && !t.IsDeleted)
                    .GroupBy(t => t.StatusId)
                    .Select(g => new { StatusId = g.Key, Count = g.Count() })
                    .ToListAsync();

                var userCount = await _context.Users.CountAsync(u => !u.IsDeleted);
                var userDetailsCount = await _context.UserDetails.CountAsync(c => !c.IsDeleted);
                var activeHOUsers = await _context.Users
                    .CountAsync(u => !u.IsDeleted && u.IsActive && u.Role.Name == "HO user");

                var stats = new
                {
                    WithdrawalRequests = new
                    {
                        Open = withdrawalStats.Where(s => s.StatusId == 1).Sum(s => s.Count),
                        Closed = withdrawalStats.Where(s => s.StatusId == 5).Sum(s => s.Count)
                    },
                    DepositRequests = new
                    {
                        Open = depositStats.Where(s => s.StatusId == 1).Sum(s => s.Count),
                        Closed = depositStats.Where(s => s.StatusId == 5).Sum(s => s.Count)
                    },
                    SupportRequests = new
                    {
                        Open = supportStats.Where(s => s.StatusId == 1).Sum(s => s.Count),
                        InProgress = supportStats.Where(s => s.StatusId == 3).Sum(s => s.Count),
                        Closed = supportStats.Where(s => s.StatusId == 5).Sum(s => s.Count)
                    },
                    UserDetailsCount = userDetailsCount,
                    UserCount = userCount,
                    ActiveHOUsers = activeHOUsers
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving dashboard stats: {ex.Message}");
            }
        }

        [HttpGet("ticket-stats")]
        public async Task<IActionResult> GetTicketStats()
        {
            try
            {
                var ticketStats = await _context.Tickets
                    .Where(t => !t.IsDeleted)
                    .GroupBy(t => new { t.TypeId, t.StatusId })
                    .Select(g => new 
                    { 
                        TypeId = g.Key.TypeId, 
                        StatusId = g.Key.StatusId, 
                        Count = g.Count() 
                    })
                    .ToListAsync();

                return Ok(ticketStats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving ticket stats: {ex.Message}");
            }
        }

        [HttpGet("user-stats")]
        public async Task<IActionResult> GetUserStats()
        {
            try
            {
                var userStats = await _context.Users
                    .Where(u => !u.IsDeleted)
                    .GroupBy(u => u.Role.Name)
                    .Select(g => new { Role = g.Key, Count = g.Count() })
                    .ToListAsync();

                return Ok(userStats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving user stats: {ex.Message}");
            }
        }
    }
}