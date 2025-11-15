using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using eConnectOne.API.Data;
using eConnectOne.API.Models;
using eConnectOne.API.Services;

namespace eConnectOne.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ITokenService _tokenService;

        public AuthController(ApplicationDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == request.Username && !u.IsDeleted);

            // Debug: Log user lookup
            Console.WriteLine($"Login attempt for: {request.Username}");
            if (user != null)
            {
                Console.WriteLine($"User found: {user.Username}, Active: {user.IsActive}, Role: {user.Role?.Name}");
            }
            else
            {
                Console.WriteLine("User not found");
            }

            if (user == null)
            {
                return Unauthorized(new { 
                    message = "Invalid username or password. Please check your credentials and try again."
                });
            }

            // Check if account is locked
            if (user.IsLocked && user.LockedUntil.HasValue && user.LockedUntil > DateTime.UtcNow)
            {
                var remainingTime = user.LockedUntil.Value - DateTime.UtcNow;
                var minutes = Math.Ceiling(remainingTime.TotalMinutes);
                return Unauthorized(new { 
                    message = $"Account temporarily locked due to multiple failed login attempts. Please try again in {minutes} minute(s) or contact your system administrator for assistance.",
                    isLocked = true,
                    lockExpiresIn = minutes
                });
            }

            // Auto-unlock if lock period has expired
            if (user.IsLocked && user.LockedUntil.HasValue && user.LockedUntil <= DateTime.UtcNow)
            {
                user.IsLocked = false;
                user.LockedUntil = null;
                user.FailedLoginAttempts = 0;
            }

            // Verify password
            Console.WriteLine($"Attempting to verify password for user: {user.Username}");
            Console.WriteLine($"Password hash in DB: {user.PasswordHash}");
            Console.WriteLine($"Password provided: {request.Password}");
            
            bool passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            Console.WriteLine($"Password verification result: {passwordValid}");
            
            if (!passwordValid)
            {
                // Increment failed attempts
                user.FailedLoginAttempts++;
                user.LastFailedLoginAt = DateTime.UtcNow;

                // Lock account after 3 failed attempts
                if (user.FailedLoginAttempts >= 3)
                {
                    user.IsLocked = true;
                    user.LockedUntil = DateTime.UtcNow.AddMinutes(30); // Lock for 30 minutes
                    await _context.SaveChangesAsync();
                    return Unauthorized(new { 
                        message = "Account has been temporarily locked due to multiple failed login attempts. Please try again in 30 minutes or contact your system administrator for immediate assistance.",
                        isLocked = true,
                        lockDuration = 30
                    });
                }

                await _context.SaveChangesAsync();
                var remainingAttempts = 3 - user.FailedLoginAttempts;
                return Unauthorized(new { 
                    message = "Invalid username or password. Please check your credentials and try again.",
                    remainingAttempts = remainingAttempts,
                    warningMessage = remainingAttempts <= 1 ? "Warning: Your account will be locked after one more failed attempt." : null
                });
            }

            // Successful login - reset failed attempts
            user.FailedLoginAttempts = 0;
            user.LastFailedLoginAt = null;
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = _tokenService.GenerateToken(user);
            return Ok(new { token });
        }

        [HttpPost("test-hash")]
        public IActionResult TestHash([FromBody] string password)
        {
            var hash = BCrypt.Net.BCrypt.HashPassword(password);
            return Ok(new { password, hash });
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}