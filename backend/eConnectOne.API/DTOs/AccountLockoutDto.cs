namespace eConnectOne.API.DTOs
{
    public class AccountLockoutDto
    {
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public int FailedLoginAttempts { get; set; }
    public bool IsLocked { get; set; }
    public DateTime? LockedUntil { get; set; }
    public DateTime? LastFailedLoginAt { get; set; }
    public int RemainingAttempts => Math.Max(0, 3 - FailedLoginAttempts);
    }

    public class UnlockAccountDto
    {
        public int UserId { get; set; }
        public string? NewPassword { get; set; }
        public bool ResetPassword { get; set; } = false;
    }
}