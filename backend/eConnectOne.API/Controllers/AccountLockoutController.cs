using eConnectOne.API.DTOs;
using eConnectOne.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace eConnectOne.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Master Admin,Admin")]
    public class AccountLockoutController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AccountLockoutController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("locked-accounts")]
        public async Task<ActionResult<IEnumerable<AccountLockoutDto>>> GetLockedAccounts()
        {
            var lockedAccounts = await _context.Users
                .Include(u => u.Role)
                .Where(u => !u.IsDeleted && (u.IsLocked || u.FailedLoginAttempts > 0))
                .Select(u => new AccountLockoutDto
                {
                    UserId = u.Id,
                    FullName = u.FullName ?? "",
                    Email = u.Email ?? "",
                    RoleName = u.Role!.Name,
                    FailedLoginAttempts = u.FailedLoginAttempts,
                    IsLocked = u.IsLocked,
                    LockedUntil = u.LockedUntil,
                    LastFailedLoginAt = u.LastFailedLoginAt
                })
                .OrderByDescending(u => u.LastFailedLoginAt)
                .ToListAsync();

            return Ok(lockedAccounts);
        }

        [HttpPost("unlock")]
        public async Task<ActionResult> UnlockAccount(UnlockAccountDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null || user.IsDeleted)
            {
                return NotFound("User not found");
            }

            // Reset lockout fields
            user.FailedLoginAttempts = 0;
            user.IsLocked = false;
            user.LockedUntil = null;
            user.LastFailedLoginAt = null;

            // Reset password if requested
            if (dto.ResetPassword && !string.IsNullOrEmpty(dto.NewPassword))
            {
                if (dto.NewPassword.Length < 6)
                {
                    return BadRequest("Password must be at least 6 characters long");
                }
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            }

            user.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Account unlocked successfully" });
        }

        [HttpGet("all-accounts")]
        public async Task<ActionResult<IEnumerable<AccountLockoutDto>>> GetAllAccountsStatus()
        {
            var accounts = await _context.Users
                .Include(u => u.Role)
                .Where(u => !u.IsDeleted && u.Role!.Name != "Master Admin") // Exclude Master Admin
                .Select(u => new AccountLockoutDto
                {
                    UserId = u.Id,
                    FullName = u.FullName ?? "",
                    Email = u.Email ?? "",
                    RoleName = u.Role!.Name,
                    FailedLoginAttempts = u.FailedLoginAttempts,
                    IsLocked = u.IsLocked,
                    LockedUntil = u.LockedUntil,
                    LastFailedLoginAt = u.LastFailedLoginAt
                })
                .OrderBy(u => u.UserId)
                .ToListAsync();

            return Ok(accounts);
        }
    }
}