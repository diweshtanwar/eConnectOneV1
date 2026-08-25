using System.Net;
using System.Net.Http.Json;
using eConnectOne.API.Tests.Infrastructure;

namespace eConnectOne.API.Tests.Tests;

/// <summary>
/// Sanity checks for POST /api/auth/login — the entry point every other test in this
/// suite depends on (via <see cref="ApiFixture"/>).
/// </summary>
[Collection(ApiTestCollection.Name)]
public class AuthTests(ApiFixture fixture)
{
    [Theory]
    [InlineData(TestUsers.MasterAdmin)]
    [InlineData(TestUsers.Admin)]
    [InlineData(TestUsers.HoUser)]
    [InlineData(TestUsers.Csp)]
    public void Login_succeeds_and_issues_a_bearer_token_for_every_role(string username)
    {
        // ApiFixture.InitializeAsync already logs every role in; if any of those logins
        // had failed, the whole fixture would have thrown during test collection setup.
        // Re-asserting here gives a clear, role-specific failure message instead.
        var client = fixture.ClientFor(username);
        Assert.NotNull(client.DefaultRequestHeaders.Authorization);
        Assert.Equal("Bearer", client.DefaultRequestHeaders.Authorization!.Scheme);
    }

    [Fact]
    public async Task Login_with_wrong_password_returns_401()
    {
        var client = fixture.AnonymousClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            username = TestUsers.MasterAdmin,
            password = "definitely-the-wrong-password"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Unauthenticated_request_to_a_protected_endpoint_returns_401()
    {
        var client = fixture.AnonymousClient();
        var response = await client.GetAsync("/api/dashboard/stats");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
