using eConnectOne.API.Data;
using eConnectOne.API.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;

namespace eConnectOne.API.Tests.Infrastructure;

/// <summary>
/// Boots the real eConnectOne.API application (Program.cs, controllers, services,
/// JWT auth, everything) against an isolated in-memory database, so tests exercise
/// the actual production request pipeline instead of mocked-out substitutes.
///
/// Each instance gets its own uniquely-named in-memory database, so tests using
/// separate factory instances never see each other's data.
/// </summary>
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = $"eConnectOneTests-{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // "Development" makes Program.cs use dbContext.Database.EnsureCreated() instead of
        // Database.Migrate() at startup — Migrate() is not supported by the InMemory provider.
        builder.UseEnvironment("Development");

        builder.ConfigureServices(services =>
        {
            // Remove every service descriptor the real Npgsql-backed AddDatabaseConfiguration
            // registered for ApplicationDbContext. Newer EF Core versions register the actual
            // provider configuration as one or more IDbContextOptionsConfiguration<TContext>
            // singletons (in addition to DbContextOptions<TContext> itself) so that multiple
            // AddDbContext calls compose — removing only DbContextOptions<TContext> leaves the
            // original Npgsql configuration singleton(s) in place, and EF Core then throws
            // "Only a single database provider can be registered" once our InMemory
            // configuration is added alongside it.
            var efCoreDescriptors = services
                .Where(d =>
                    d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>) ||
                    d.ServiceType == typeof(DbContextOptions) ||
                    d.ServiceType == typeof(ApplicationDbContext) ||
                    (d.ServiceType.IsGenericType &&
                     d.ServiceType.GetGenericTypeDefinition() == typeof(IDbContextOptionsConfiguration<>) &&
                     d.ServiceType.GenericTypeArguments[0] == typeof(ApplicationDbContext)))
                .ToList();
            foreach (var descriptor in efCoreDescriptors)
            {
                services.Remove(descriptor);
            }

            // ...and replace it with an isolated in-memory database for this factory instance.
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase(_dbName);
                options.ConfigureWarnings(w =>
                    w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
            });
        });
    }

    /// <summary>
    /// Seeds one test user per role (Master Admin, Admin, HO user, CSP) with a known
    /// password, in addition to whatever Program.cs's own startup seeding created.
    /// Safe to call multiple times — skips users that already exist.
    /// </summary>
    public void SeedTestUsers()
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Program.cs's startup seeding runs during host build (before this method is called),
        // so roles from ApplicationDbContext's HasData seed (Master Admin/Admin/HO user/CSP)
        // already exist. EnsureCreated() applies model HasData seeds automatically.
        foreach (var (username, roleName) in TestUsers.All)
        {
            if (db.Users.Any(u => u.Username == username))
            {
                continue;
            }

            var role = db.Roles.FirstOrDefault(r => r.Name == roleName)
                ?? throw new InvalidOperationException($"Seed role '{roleName}' not found — check ApplicationDbContext HasData seed.");

            db.Users.Add(new User
            {
                Username = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(TestUsers.Password),
                RoleId = role.Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                IsDeleted = false,
                Email = $"{username}@test.local",
                FullName = $"Test {roleName}"
            });
        }

        db.SaveChanges();
    }
}
