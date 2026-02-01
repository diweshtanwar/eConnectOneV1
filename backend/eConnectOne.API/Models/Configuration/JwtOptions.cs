namespace eConnectOne.API.Models.Configuration;

/// <summary>
/// JWT (JSON Web Token) configuration options.
/// These settings are used for generating and validating authentication tokens.
/// </summary>
public class JwtOptions
{
    /// <summary>
    /// Secret key used for signing JWT tokens. Must be at least 32 characters long.
    /// </summary>
    public string Key { get; set; } = string.Empty;

    /// <summary>
    /// Token issuer name. Used during token validation.
    /// </summary>
    public string Issuer { get; set; } = string.Empty;

    /// <summary>
    /// Token audience. Used during token validation.
    /// </summary>
    public string Audience { get; set; } = string.Empty;

    /// <summary>
    /// Token expiration time in minutes. Default is 60 minutes.
    /// </summary>
    public int DurationInMinutes { get; set; } = 60;
}
