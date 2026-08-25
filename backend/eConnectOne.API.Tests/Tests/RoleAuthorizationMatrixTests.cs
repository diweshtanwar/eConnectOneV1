using System.Net;
using eConnectOne.API.Tests.Infrastructure;

namespace eConnectOne.API.Tests.Tests;

/// <summary>
/// Locks in the intended role-based access matrix for endpoints that restrict access
/// via [Authorize(Roles = "...")]. Each test asserts BOTH sides: allowed roles must
/// NOT be rejected with 403, and disallowed roles MUST be rejected with 403.
///
/// This is a direct regression guard for two real bugs found in this codebase:
///   1. WalletController / RiskManagementController checked for role "HO User" (capital
///      U) while the seeded database role is "HO user" (lowercase u). ASP.NET Core's
///      role-claim comparison is case-sensitive, so real "HO user" accounts were
///      silently rejected with 403 on wallet balance/transactions endpoints.
///   2. RolePermissionsController only allowed "Master Admin", but the frontend's
///      menuFilter.ts grants Admin the same full menu access as Master Admin — so
///      Admin users hit the System Settings page and got a silent "Failed to fetch
///      permissions" error because the backend rejected them.
///
/// If either of those role strings ever gets out of sync again, the corresponding
/// test below will fail with a clear message instead of only surfacing as a
/// customer-facing error in the UI.
/// </summary>
[Collection(ApiTestCollection.Name)]
public class RoleAuthorizationMatrixTests(ApiFixture fixture)
{
    private async Task AssertAllowed(string username, HttpMethod method, string path, HttpContent? content = null)
    {
        var client = fixture.ClientFor(username);
        var request = new HttpRequestMessage(method, path) { Content = content };
        var response = await client.SendAsync(request);

        Assert.True(
            response.StatusCode != HttpStatusCode.Forbidden,
            $"Expected '{username}' to be allowed (not 403) on {method} {path}, but got 403 Forbidden. " +
            "Check the [Authorize(Roles=...)] attribute's role name spelling/casing against the seeded Role table.");
    }

    private async Task AssertForbidden(string username, HttpMethod method, string path, HttpContent? content = null)
    {
        var client = fixture.ClientFor(username);
        var request = new HttpRequestMessage(method, path) { Content = content };
        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    // ---- RolePermissionsController: GET /api/rolepermissions ----
    // [Authorize(Roles = "Master Admin,Admin")]

    [Theory]
    [InlineData(TestUsers.MasterAdmin)]
    [InlineData(TestUsers.Admin)]
    public Task RolePermissions_get_is_allowed_for_admin_roles(string username) =>
        AssertAllowed(username, HttpMethod.Get, "/api/rolepermissions");

    [Theory]
    [InlineData(TestUsers.HoUser)]
    [InlineData(TestUsers.Csp)]
    public Task RolePermissions_get_is_forbidden_for_non_admin_roles(string username) =>
        AssertForbidden(username, HttpMethod.Get, "/api/rolepermissions");

    // ---- WalletController: GET /api/wallet/user/{userId} ----
    // [Authorize(Roles = "Master Admin,Admin,HO user")]

    [Theory]
    [InlineData(TestUsers.MasterAdmin)]
    [InlineData(TestUsers.Admin)]
    [InlineData(TestUsers.HoUser)]
    public Task GetUserWallet_is_allowed_for_master_admin_admin_and_ho_user(string username) =>
        AssertAllowed(username, HttpMethod.Get, "/api/wallet/user/999999");

    [Fact]
    public Task GetUserWallet_is_forbidden_for_csp() =>
        AssertForbidden(TestUsers.Csp, HttpMethod.Get, "/api/wallet/user/999999");

    // ---- RiskManagementController (class-level): GET /api/riskmanagement/alerts ----
    // [Authorize(Roles = "Master Admin,Admin,HO user")]

    [Theory]
    [InlineData(TestUsers.MasterAdmin)]
    [InlineData(TestUsers.Admin)]
    [InlineData(TestUsers.HoUser)]
    public Task RiskAlerts_is_allowed_for_master_admin_admin_and_ho_user(string username) =>
        AssertAllowed(username, HttpMethod.Get, "/api/riskmanagement/alerts");

    [Fact]
    public Task RiskAlerts_is_forbidden_for_csp() =>
        AssertForbidden(TestUsers.Csp, HttpMethod.Get, "/api/riskmanagement/alerts");

    // ---- RiskManagementController: PUT /api/riskmanagement/limits/{userId} ----
    // [Authorize(Roles = "Master Admin")] (method-level override — stricter than the class)

    [Fact]
    public Task UpdateUserLimits_is_allowed_for_master_admin() =>
        AssertAllowed(TestUsers.MasterAdmin, HttpMethod.Put, "/api/riskmanagement/limits/999999",
            JsonContent("{}"));

    [Theory]
    [InlineData(TestUsers.Admin)]
    [InlineData(TestUsers.HoUser)]
    [InlineData(TestUsers.Csp)]
    public Task UpdateUserLimits_is_forbidden_for_non_master_admin_roles(string username) =>
        AssertForbidden(username, HttpMethod.Put, "/api/riskmanagement/limits/999999", JsonContent("{}"));

    // ---- UsersController: POST /api/users/{id}/reset-password ----
    // [Authorize(Roles = "Master Admin")] — only Master Admin can reset another user's password

    [Fact]
    public Task ResetUserPassword_is_allowed_for_master_admin() =>
        AssertAllowed(TestUsers.MasterAdmin, HttpMethod.Post, "/api/users/999999/reset-password",
            JsonContent("{\"newPassword\":\"Whatever@123\"}"));

    [Theory]
    [InlineData(TestUsers.Admin)]
    [InlineData(TestUsers.HoUser)]
    [InlineData(TestUsers.Csp)]
    public Task ResetUserPassword_is_forbidden_for_non_master_admin_roles(string username) =>
        AssertForbidden(username, HttpMethod.Post, "/api/users/999999/reset-password",
            JsonContent("{\"newPassword\":\"Whatever@123\"}"));

    // ---- CommissionController: DELETE /api/commission/{commissionId} ----
    // [Authorize(Roles = "Master Admin")]

    [Fact]
    public Task DeleteCommission_is_allowed_for_master_admin() =>
        AssertAllowed(TestUsers.MasterAdmin, HttpMethod.Delete, $"/api/commission/{Guid.NewGuid()}");

    [Theory]
    [InlineData(TestUsers.Admin)]
    [InlineData(TestUsers.HoUser)]
    [InlineData(TestUsers.Csp)]
    public Task DeleteCommission_is_forbidden_for_non_master_admin_roles(string username) =>
        AssertForbidden(username, HttpMethod.Delete, $"/api/commission/{Guid.NewGuid()}");

    private static StringContent JsonContent(string json) =>
        new(json, System.Text.Encoding.UTF8, "application/json");
}
