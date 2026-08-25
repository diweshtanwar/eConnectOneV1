# eConnectOneV1 Configuration Guide

## Overview

This guide explains how the configuration system works and how the app is deployed to Azure as a single combined frontend+backend container.

## Architecture

The configuration system is built on standard .NET Core patterns:

### 1. **Strongly-Typed Configuration Classes** (`Models/Configuration/`)

```csharp
// JwtOptions.cs - JWT token settings
public class JwtOptions
{
    public string Key { get; set; }           // Secret key (32+ chars)
    public string Issuer { get; set; }        // Token issuer
    public string Audience { get; set; }      // Token audience
    public int DurationInMinutes { get; set; } // Expiration time
}

// DatabaseOptions.cs - Database connection settings
public class DatabaseOptions
{
    public string? ConnectionString { get; set; } // Connection string
    public int CommandTimeout { get; set; }       // Timeout in seconds
    public int MaxRetryCount { get; set; }        // Retry attempts
    public bool EnableLogging { get; set; }       // EF Core logging
}

// CorsOptions.cs - CORS allowed origins
public class CorsOptions
{
    public string[] AllowedOrigins { get; set; }  // Allowed domains
}
```

### 2. **Database Configuration Extension** (`Extensions/DatabaseConfigurationExtensions.cs`)

Automatically:
- Parses PostgreSQL URI format from `DATABASE_URL` environment variable
- Converts to Entity Framework Core connection string format
- Detects connection type (Railway, Render, AWS RDS, Azure, Supabase, etc.)
- Configures Npgsql pooling based on provider

### 3. **Configuration Files**

```
appsettings.json              (Local defaults)
appsettings.Development.json  (Development overrides)
appsettings.Production.json   (Production defaults)
```

---

## Configuration Priority

1. **Environment Variables** (highest priority)
   - `DATABASE_URL` - Overrides all connection strings
   - Custom environment variables

2. **appsettings.{Environment}.json**
   - `appsettings.Production.json` for production
   - `appsettings.Development.json` for development
   - `appsettings.json` as fallback

3. **appsettings.json** (lowest priority)
   - Default configuration

---

## Deployment Guide

### Deploy to Azure (Container Apps)

The app builds as a single Docker image (frontend + backend combined, see root `Dockerfile`) and deploys as one Azure Container App. See [AZURE_DEPLOYMENT_GUIDE.md](AZURE_DEPLOYMENT_GUIDE.md) for the full walkthrough (infra provisioning via `infra/main.bicep`, CI/CD via GitHub Actions).

1. Provision infra with Bicep (`infra/main.bicep`) - creates ACR, PostgreSQL Flexible Server, Key Vault, and one Container App.
2. `DATABASE_URL` and `JWT-SECRET-KEY` are stored in Key Vault and injected as Container App secrets.
3. Push to `main` -> GitHub Actions builds the combined image and deploys it to the Container App.

**Connection String Format:**
```
postgresql://user@server:password@server.postgres.database.azure.com:5432/database
```

---

## Local Development Setup

### Prerequisites
- .NET 10.0 SDK
- PostgreSQL 14+ (local or managed service)
- Node.js 20+ (for frontend)

### Steps

1. **Clone repository**
   ```bash
   git clone https://github.com/diweshtanwar/eConnectOneV1.git
   cd eConnectOneV1
   ```

2. **Configure local database** (appsettings.Development.json)
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Port=5432;Database=eConnectOne;User Id=postgres;Password=postgres@123;"
     },
     "Cors": {
       "AllowedOrigins": ["http://localhost:5173"]
     }
   }
   ```

3. **Run backend**
   ```bash
   cd backend/eConnectOne.API
   dotnet run
   ```

4. **Run frontend** (in another terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001/api
   - Swagger: http://localhost:5001/swagger

---

## Environment Variables Reference

### Environment Variables

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | Yes | `postgresql://...` | Connection string (overrides appsettings), injected from Key Vault |
| `ASPNETCORE_ENVIRONMENT` | Yes | `Production` | Selects appsettings file |
| `ASPNETCORE_URLS` | No | `http://+:80` | Set by the container/Container App |
| `JWT-SECRET-KEY` | Yes | (secret) | Overrides `Jwt:Key` from Key Vault |

**Azure:**
- `WEBSITE_INSTANCE_ID` (auto-set)
- `WEBSITES_PORT` (optional, default 80)

---

## Database Connection String Formats

### Azure Database for PostgreSQL
```
postgresql://user@server:password@server.postgres.database.azure.com:5432/database
```

### Local Development
```
Server=localhost;Port=5432;Database=eConnectOne;User Id=postgres;Password=postgres@123;
```

---
## Configuration Files Structure

### appsettings.json (Local Development Defaults)
```json
{
  "Logging": { "LogLevel": { "Default": "Warning" } },
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;..."
  },
  "Database": {
    "CommandTimeout": 30,
    "MaxRetryCount": 3,
    "EnableLogging": false
  },
  "Jwt": {
    "Key": "your_secret_key...",
    "Issuer": "eConnectOne",
    "Audience": "eConnectOne.UI",
    "DurationInMinutes": 60
  },
  "Cors": {
    "AllowedOrigins": []
  }
}
```

### appsettings.Development.json (Local Development Overrides)
```json
{
  "Logging": { "LogLevel": { "Default": "Information" } },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:5174"
    ]
  }
}
```

### appsettings.Production.json (Production Defaults)
```json
{
  "Logging": { "LogLevel": { "Default": "Warning" } },
  "Cors": {
    "AllowedOrigins": []
  }
}
```

---

## Adding New Configuration Settings

### Step 1: Create Configuration Class
```csharp
// Models/Configuration/MyOptions.cs
public class MyOptions
{
    public string Setting1 { get; set; } = string.Empty;
    public int Setting2 { get; set; } = 0;
}
```

### Step 2: Add to appsettings.json
```json
{
  "MySettings": {
    "Setting1": "value",
    "Setting2": 10
  }
}
```

### Step 3: Register in Program.cs
```csharp
builder.Services.Configure<MyOptions>(
    builder.Configuration.GetSection("MySettings"));
```

### Step 4: Use in Services
```csharp
public class MyService
{
    private readonly MyOptions _options;

    public MyService(IOptions<MyOptions> options)
    {
        _options = options.Value;
    }
}
```

---

## Troubleshooting

### Connection String Not Found
```
ERROR: No database connection string found. Please provide DATABASE_URL...
```
**Solution:** Set `DATABASE_URL` environment variable or update `appsettings.json`

### JWT Configuration Missing
```
ERROR: JWT configuration section is missing in appsettings.json
```
**Solution:** Ensure `Jwt` section exists in appsettings with `Key`, `Issuer`, `Audience`

### Database Connection Failed
```
ERROR: password authentication failed for user "postgres"
```
**Solution:** Verify `DATABASE_URL` has correct credentials and format

### CORS Errors in Browser
```
CORS policy: No 'Access-Control-Allow-Origin' header
```
**Solution:** Add frontend origin to `Cors.AllowedOrigins` in appsettings

### Wrong Environment Configuration Loaded
```
Configuration is loading Development settings but we're in Production
```
**Solution:** Set `ASPNETCORE_ENVIRONMENT=Production` environment variable

---

## Best Practices

### ✅ DO

- Use environment variables for sensitive data (passwords, API keys)
- Use `IOptions<T>` pattern for type-safe configuration
- Keep `appsettings.json` in version control with default values
- Create environment-specific `appsettings.{Environment}.json` files
- Document all required environment variables
- Use connection pooling for production databases

### ❌ DON'T

- Commit passwords or API keys directly to appsettings.json
- Use magic strings for configuration values
- Mix environment variable and appsettings configuration
- Hardcode configuration in code
- Share `appsettings.Production.json` in development

---

## Quick Platform Comparison

| Feature | Railway | Render | AWS | Azure |
|---------|---------|--------|-----|-------|
| Auto `DATABASE_URL` | ✅ | ✅ | ❌ | ❌ |
| Free Tier | ✅ | ✅ | Limited | ✅ |
| Auto Redeploy | ✅ | ✅ | ❌ | ✅ |
| Managed Database | ✅ | ✅ | ✅ | ✅ |
| Scaling | ✅ | ✅ | ✅ | ✅ |
| Setup Complexity | Low | Low | Medium | Low |

---

## Migration Between Platforms

### From Railway to Render
1. Export database from Railway
2. Import to Render managed database
3. Update `DATABASE_URL` in Render settings
4. Deploy → Done!

### From Render to AWS
1. Export database from Render/Supabase
2. Create AWS RDS instance
3. Import database to RDS
4. Update `DATABASE_URL` to AWS RDS connection string
5. Deploy → Done!

---

## Support & Additional Resources

- [.NET Configuration Documentation](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html)
- [Entity Framework Core Documentation](https://learn.microsoft.com/en-us/ef/core/)
- [Azure Container Apps Documentation](https://learn.microsoft.com/en-us/azure/container-apps/)
- [Azure Database for PostgreSQL Documentation](https://learn.microsoft.com/en-us/azure/postgresql/)

