namespace eConnectOne.API.Models.Configuration;

/// <summary>
/// Database configuration options for PostgreSQL connections.
/// These settings control connection behavior, timeouts, and retry policies.
/// </summary>
public class DatabaseOptions
{
    /// <summary>
    /// Database connection string. Can be overridden by DATABASE_URL environment variable.
    /// Supports both PostgreSQL URI format (postgresql://...) and EF Core format (Server=...;).
    /// </summary>
    public string? ConnectionString { get; set; }

    /// <summary>
    /// Command timeout in seconds. Default is 30 seconds.
    /// </summary>
    public int CommandTimeout { get; set; } = 30;

    /// <summary>
    /// Maximum number of retries for transient database failures.
    /// Default is 3 retries.
    /// </summary>
    public int MaxRetryCount { get; set; } = 3;

    /// <summary>
    /// Enable detailed Entity Framework Core logging to console/debug output.
    /// Default is false to avoid verbose logging in production.
    /// </summary>
    public bool EnableLogging { get; set; } = false;
}
