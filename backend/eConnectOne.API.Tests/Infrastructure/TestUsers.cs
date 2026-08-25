namespace eConnectOne.API.Tests.Infrastructure;

/// <summary>
/// Well-known test accounts, one per role, shared across all test classes.
/// Role names here MUST exactly match the seed data in
/// ApplicationDbContext.OnModelCreating's Role.HasData (case-sensitive — this is
/// exactly the class of bug this test suite exists to catch, see
/// RoleAuthorizationMatrixTests).
/// </summary>
public static class TestUsers
{
    public const string Password = "Test@12345";

    public const string MasterAdmin = "test_master_admin";
    public const string Admin = "test_admin";
    public const string HoUser = "test_ho_user";
    public const string Csp = "test_csp";

    public static readonly (string Username, string RoleName)[] All =
    [
        (MasterAdmin, "Master Admin"),
        (Admin, "Admin"),
        (HoUser, "HO user"),
        (Csp, "CSP"),
    ];
}
