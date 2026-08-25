using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace eConnectOne.API.Tests.Infrastructure;

/// <summary>
/// Shared test fixture: boots one <see cref="CustomWebApplicationFactory"/>, seeds the
/// four role-based test accounts, and lazily logs each one in through the real
/// POST /api/auth/login endpoint (exercising the actual BCrypt + JWT issuance code),
/// caching the resulting authenticated <see cref="HttpClient"/> per role so tests don't
/// re-authenticate on every request.
///
/// Shared across all tests in a collection via [Collection(Name)] — see
/// <see cref="ApiTestCollection"/> — so the (relatively expensive) app startup and
/// login round-trips only happen once per test run, not once per test class.
/// </summary>
public class ApiFixture : IAsyncLifetime
{
    public CustomWebApplicationFactory Factory { get; } = new();

    private readonly Dictionary<string, HttpClient> _clientsByUsername = new();

    public async Task InitializeAsync()
    {
        Factory.SeedTestUsers();
        foreach (var (username, _) in TestUsers.All)
        {
            _clientsByUsername[username] = await LoginAsync(username, TestUsers.Password);
        }
    }

    public Task DisposeAsync()
    {
        foreach (var client in _clientsByUsername.Values)
        {
            client.Dispose();
        }
        Factory.Dispose();
        return Task.CompletedTask;
    }

    /// <summary>An authenticated HttpClient for one of the well-known <see cref="TestUsers"/> accounts.</summary>
    public HttpClient ClientFor(string username) => _clientsByUsername[username];

    public HttpClient MasterAdminClient => ClientFor(TestUsers.MasterAdmin);
    public HttpClient AdminClient => ClientFor(TestUsers.Admin);
    public HttpClient HoUserClient => ClientFor(TestUsers.HoUser);
    public HttpClient CspClient => ClientFor(TestUsers.Csp);

    /// <summary>An HttpClient with no Authorization header, for testing anonymous/401 behavior.</summary>
    public HttpClient AnonymousClient() => Factory.CreateClient();

    private async Task<HttpClient> LoginAsync(string username, string password)
    {
        var client = Factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new { username, password });
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<LoginResponse>();
        if (body?.Token is null)
        {
            throw new InvalidOperationException($"Login for '{username}' did not return a token.");
        }

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body.Token);
        return client;
    }

    private sealed class LoginResponse
    {
        public string? Token { get; set; }
    }
}

/// <summary>
/// xUnit test collection definition: all test classes decorated with
/// [Collection(ApiTestCollection.Name)] share a single <see cref="ApiFixture"/>
/// instance (and therefore a single app host + in-memory database + set of
/// logged-in role clients) instead of each getting their own.
/// </summary>
[CollectionDefinition(Name)]
public class ApiTestCollection : ICollectionFixture<ApiFixture>
{
    public const string Name = "eConnectOne API";
}
