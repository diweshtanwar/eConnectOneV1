namespace eConnectOne.API.Models.Configuration;

/// <summary>
/// CORS (Cross-Origin Resource Sharing) configuration options.
/// Specifies which origins are allowed to make requests to this API.
/// </summary>
public class CorsOptions
{
    /// <summary>
    /// Array of allowed origins that can make cross-origin requests to this API.
    /// Examples: "https://example.com", "http://localhost:3000", "https://app.github.io"
    /// </summary>
    public string[] AllowedOrigins { get; set; } = Array.Empty<string>();
}
