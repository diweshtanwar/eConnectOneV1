using eConnectOne.API.Data;
using eConnectOne.API.Models.Configuration;
using Microsoft.EntityFrameworkCore;

namespace eConnectOne.API.Extensions;

/// <summary>
/// Extension methods for configuring database services.
/// Handles connection string parsing from various formats (PostgreSQL URI, EF Core format, environment variables).
/// Supports Railway, Render, AWS RDS, Azure Database, Supabase, and other PostgreSQL providers.
/// </summary>
public static class DatabaseConfigurationExtensions
{
    /// <summary>
    /// Adds database configuration to the DI container.
    /// Automatically detects and parses connection strings from DATABASE_URL environment variable
    /// or falls back to appsettings configuration.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <param name="databaseUrl">The database URL from environment variable (can be null).</param>
    /// <param name="configuration">The application configuration.</param>
    /// <returns>The service collection for chaining.</returns>
    public static IServiceCollection AddDatabaseConfiguration(
        this IServiceCollection services,
        string? databaseUrl,
        IConfiguration configuration)
    {
        // Get DatabaseOptions from appsettings
        var dbOptions = configuration.GetSection("Database").Get<DatabaseOptions>() ?? new();

        // Determine the connection string to use
        // Priority: DATABASE_URL env var > appsettings Database section > DefaultConnection
        var connectionString = GetConnectionString(databaseUrl, dbOptions, configuration);

        // Add DbContext with Npgsql provider
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.CommandTimeout(dbOptions.CommandTimeout);
                npgsqlOptions.EnableRetryOnFailure(maxRetryCount: dbOptions.MaxRetryCount);
            });

            // Enable query logging if configured
            if (dbOptions.EnableLogging)
            {
                options.LogTo(Console.WriteLine);
            }

            // Suppress shadow property warnings from navigation properties
            options.ConfigureWarnings(w => 
                w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        });

        return services;
    }

    /// <summary>
    /// Determines the connection string to use from multiple sources.
    /// Handles both PostgreSQL URI format (from environment) and EF Core format (from appsettings).
    /// </summary>
    private static string GetConnectionString(string? databaseUrl, DatabaseOptions dbOptions, IConfiguration configuration)
    {
        // If DATABASE_URL is provided, parse it
        if (!string.IsNullOrEmpty(databaseUrl))
        {
            if (databaseUrl.StartsWith("postgresql://"))
            {
                return ParsePostgresqlUri(databaseUrl);
            }
            else
            {
                // DATABASE_URL is already in correct format
                Console.WriteLine("✅ Using DATABASE_URL from environment (already in correct format)");
                return databaseUrl;
            }
        }

        // Fall back to appsettings configuration
        if (!string.IsNullOrEmpty(dbOptions.ConnectionString))
        {
            Console.WriteLine("✅ Using connection string from appsettings Database section");
            return dbOptions.ConnectionString;
        }

        // Final fallback to DefaultConnection
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrEmpty(connectionString))
        {
            Console.WriteLine("✅ Using connection string from appsettings DefaultConnection section");
            return connectionString;
        }

        throw new InvalidOperationException(
            "No database connection string found. Please provide DATABASE_URL environment variable " +
            "or configure ConnectionStrings:DefaultConnection in appsettings.json");
    }

    /// <summary>
    /// Parses a PostgreSQL URI format connection string to EF Core format.
    /// 
    /// PostgreSQL URI format: postgresql://user:password@host:port/database
    /// EF Core format: Server=host;Port=port;Database=database;User Id=user;Password=password;
    /// 
    /// Supports:
    /// - Railway: postgresql://user:pass@centerbeam.proxy.rlwy.net:port/database
    /// - Render: postgresql://user:pass@host:port/database
    /// - AWS RDS: postgresql://user:pass@rds.amazonaws.com:5432/database
    /// - Azure Database: postgresql://user@server:pass@host:5432/database
    /// - Supabase (direct): postgresql://user:pass@db.supabase.co:5432/postgres
    /// - Supabase (pooler): postgresql://user.role:pass@pooler.supabase.com:6543/postgres
    /// </summary>
    private static string ParsePostgresqlUri(string postgresqlUri)
    {
        try
        {
            var uri = new Uri(postgresqlUri);
            var userInfo = uri.UserInfo.Split(':');
            var username = userInfo[0];
            var password = userInfo.Length > 1 ? userInfo[1] : "";
            var hostname = uri.Host;
            var port = uri.Port > 0 ? uri.Port : 5432;
            var database = uri.LocalPath.TrimStart('/');

            // Detect connection type for logging purposes
            string connectionType = DetectConnectionType(hostname, port);

            // Determine if we should use Npgsql connection pooling
            // For Supabase pooler (port 6543) or other managed poolers, let them handle pooling
            bool useNpgsqlPooling = (hostname.Contains("pooler.supabase.com") || port == 6543);

            // Build EF Core connection string
            var connectionString = $"Server={hostname};" +
                                   $"Port={port};" +
                                   $"Database={database};" +
                                   $"User Id={username};" +
                                   $"Password={password};" +
                                   $"SSL Mode=Require;" +
                                   $"Trust Server Certificate=true;" +
                                   $"CommandTimeout=30;" +
                                   $"Pooling={useNpgsqlPooling};";

            Console.WriteLine($"✅ DATABASE_URL parsed successfully");
            Console.WriteLine($"   Connection Type: {connectionType}");
            Console.WriteLine($"   Server: {hostname}");
            Console.WriteLine($"   Port: {port}");
            Console.WriteLine($"   Database: {database}");
            Console.WriteLine($"   Npgsql Pooling: {useNpgsqlPooling}");

            return connectionString;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ ERROR parsing DATABASE_URL");
            Console.WriteLine($"   Message: {ex.Message}");
            Console.WriteLine($"   URL Format: postgresql://user:password@host:port/database");
            throw;
        }
    }

    /// <summary>
    /// Detects the connection type based on hostname and port.
    /// Helps identify which platform the database is hosted on.
    /// </summary>
    private static string DetectConnectionType(string hostname, int port)
    {
        return (hostname, port) switch
        {
            // Supabase pooler (transaction mode)
            (var h, 6543) when h.Contains("pooler.supabase.com") => "Supabase Transaction Pooler",
            
            // Supabase direct connection
            (var h, 5432) when h.Contains("supabase.co") => "Supabase Direct Connection",
            
            // Railway
            (var h, _) when h.Contains("railway.internal") || h.Contains("proxy.rlwy.net") => "Railway PostgreSQL",
            
            // AWS RDS
            (var h, _) when h.Contains("rds.amazonaws.com") => "AWS RDS PostgreSQL",
            
            // Azure Database for PostgreSQL
            (var h, _) when h.Contains("postgres.database.azure.com") => "Azure Database for PostgreSQL",
            
            // DigitalOcean Managed Database
            (var h, _) when h.Contains("ondigitalocean.com") => "DigitalOcean Managed PostgreSQL",
            
            // Render
            (var h, _) when h.Contains("postgres") && h.Contains("render") => "Render PostgreSQL",
            
            // Generic/unknown
            _ => $"PostgreSQL ({hostname}:{port})"
        };
    }
}
