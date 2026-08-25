using System.Net;
using eConnectOne.API.Tests.Infrastructure;

namespace eConnectOne.API.Tests.Tests;

/// <summary>
/// Baseline "does the app even work for this role" smoke tests — endpoints every
/// authenticated user should be able to reach regardless of role, covering the
/// pages a Master Admin, Admin, HO user, or CSP account lands on right after login
/// (Dashboard, own wallet, roles list). If any of these return 500/403 for a given
/// role, that's the class of bug that shows up in the UI as the generic
/// "Oops! Something went wrong" error boundary screen.
/// </summary>
[Collection(ApiTestCollection.Name)]
public class GeneralAuthenticatedAccessTests(ApiFixture fixture)
{
    public static IEnumerable<object[]> AllRoles =>
    [
        [TestUsers.MasterAdmin],
        [TestUsers.Admin],
        [TestUsers.HoUser],
        [TestUsers.Csp],
    ];

    [Theory]
    [MemberData(nameof(AllRoles))]
    public async Task Dashboard_stats_loads_successfully_for_every_role(string username)
    {
        var response = await fixture.ClientFor(username).GetAsync("/api/dashboard/stats");
        Assert.True(response.IsSuccessStatusCode,
            $"GET /api/dashboard/stats failed for '{username}' with {(int)response.StatusCode} {response.StatusCode}");
    }

    [Theory]
    [MemberData(nameof(AllRoles))]
    public async Task Own_wallet_loads_successfully_for_every_role(string username)
    {
        // WalletController.GetWallet() is class-level [Authorize] (no role restriction) —
        // every authenticated user can fetch their own wallet, auto-created on first access.
        var response = await fixture.ClientFor(username).GetAsync("/api/wallet");
        Assert.True(response.IsSuccessStatusCode,
            $"GET /api/wallet failed for '{username}' with {(int)response.StatusCode} {response.StatusCode}");
    }

    [Theory]
    [MemberData(nameof(AllRoles))]
    public async Task Roles_list_loads_successfully_for_every_role(string username)
    {
        var response = await fixture.ClientFor(username).GetAsync("/api/roles");
        Assert.True(response.IsSuccessStatusCode,
            $"GET /api/roles failed for '{username}' with {(int)response.StatusCode} {response.StatusCode}");
    }

    [Theory]
    [MemberData(nameof(AllRoles))]
    public async Task Own_commissions_loads_successfully_for_every_role(string username)
    {
        var response = await fixture.ClientFor(username).GetAsync("/api/commission");
        Assert.True(response.IsSuccessStatusCode,
            $"GET /api/commission failed for '{username}' with {(int)response.StatusCode} {response.StatusCode}");
    }
}
