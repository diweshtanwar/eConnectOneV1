using System.Text;
using eConnectOne.API.Data;
using eConnectOne.API.Extensions;
using eConnectOne.API.Models;
using eConnectOne.API.Models.Configuration;
using eConnectOne.API.Services;
using eConnectOne.API.Services.Tickets;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// Configure strongly-typed options from appsettings
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.Configure<DatabaseOptions>(builder.Configuration.GetSection("Database"));
builder.Services.Configure<CorsOptions>(builder.Configuration.GetSection("Cors"));

// Get DATABASE_URL from environment (e.g. injected from Azure Key Vault)
// Falls back to appsettings configuration if not set
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

// Add database configuration
try
{
    builder.Services.AddDatabaseConfiguration(databaseUrl, builder.Configuration);
    Console.WriteLine("✅ Database configuration added successfully");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ ERROR configuring database: {ex.Message}");
    throw;
}

// Register application services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<IAttachmentService, AttachmentService>();
builder.Services.AddScoped<IWalletService, WalletService>();
builder.Services.AddScoped<IFraudDetectionService, FraudDetectionService>();
builder.Services.AddScoped<IReconciliationService, ReconciliationService>();
builder.Services.AddScoped<ILimitValidationService, LimitValidationService>();
builder.Services.AddScoped<ICommissionService, CommissionService>();
builder.Services.AddScoped<IEnhancedAuditLogService, EnhancedAuditLogService>();

// Configure JWT authentication using typed options
var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>();

// Allow JWT key override from environment variable (for production/KV injection)
var envJwtKey = Environment.GetEnvironmentVariable("JWT-SECRET-KEY");
if (jwtOptions != null && !string.IsNullOrEmpty(envJwtKey) && !envJwtKey.Contains("PLACEHOLDER"))
{
    jwtOptions.Key = envJwtKey;

    // Also write the override back into IConfiguration so any component that reads
    // "Jwt:Key" directly (e.g. TokenService) sees the real key instead of the
    // appsettings.json placeholder. Without this, tokens are minted with the
    // placeholder value while validation uses the real key, causing every
    // authenticated request after login to fail with 401.
    builder.Configuration["Jwt:Key"] = envJwtKey;
}

// Override AllowedHosts from env var for production (set to actual hostname)
var allowedHosts = Environment.GetEnvironmentVariable("ALLOWED_HOSTS");
if (!string.IsNullOrEmpty(allowedHosts) && !allowedHosts.Contains("PLACEHOLDER"))
{
    builder.WebHost.UseKestrel();
    // AllowedHosts is applied via configuration — set it here
    builder.Configuration["AllowedHosts"] = allowedHosts;
}

if (jwtOptions == null)
{
    throw new InvalidOperationException("JWT configuration section is missing in appsettings.json");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtOptions.Issuer,
        ValidAudience = jwtOptions.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key))
    };
});

// Frontend + backend are served same-origin in production (single container), so CORS
// is mainly needed for local development where Vite runs on a separate port.
// Additional trusted origins can be added via appsettings "Cors:AllowedOrigins" or the
// FRONTEND_ORIGIN environment variable without requiring a code change.
var corsOptions = builder.Configuration.GetSection("Cors").Get<CorsOptions>() ?? new();
var frontendOrigin = Environment.GetEnvironmentVariable("FRONTEND_ORIGIN");

var allowedOrigins = new HashSet<string>(corsOptions.AllowedOrigins, StringComparer.OrdinalIgnoreCase)
{
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3001"
};
if (!string.IsNullOrWhiteSpace(frontendOrigin))
{
    allowedOrigins.Add(frontendOrigin);
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(allowedOrigins.ToArray())
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials();
        });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "eConnectOne API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
    });
});


var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // Enable Swagger in production too for testing
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.RoutePrefix = "swagger";
    });
}

// Add error logging middleware before everything else
app.UseMiddleware<eConnectOne.API.Middleware.ErrorLoggingMiddleware>();

app.UseHttpsRedirection();

app.UseDefaultFiles(); // Serve wwwroot/index.html for "/" requests (frontend SPA)
app.UseStaticFiles(); // Enable serving static files (frontend assets, attachments)

app.UseCors("AllowFrontend");

// Add rate limiting middleware (disabled for development)
// app.UseMiddleware<eConnectOne.API.Middleware.RateLimitingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint — used by deployment pipeline and Azure
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// SPA fallback for the React portal — any /app/* route that doesn't match a static
// file serves the portal's own index.html so client-side routing works on refresh/deep links.
app.MapFallbackToFile("/app/{*path}", "app/index.html");

// Fallback for everything else — serves the public landing site's index.html
// (landing-site/ is copied to wwwroot root, so this is the eGramin marketing site).
app.MapFallbackToFile("index.html");

// Initialize database with EF Core migrations
try
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (app.Environment.IsDevelopment())
        {
            dbContext.Database.EnsureCreated();
        }
        else
        {
            dbContext.Database.Migrate();
        }

        if (!dbContext.Users.Any())
        {
            var masterRole = dbContext.Roles.FirstOrDefault(r => r.Name == "Master Admin");
            if (masterRole == null)
            {
                masterRole = new Role { Name = "Master Admin", IsDeleted = false };
                dbContext.Roles.Add(masterRole);
                dbContext.SaveChanges();
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword("admin123");
            var adminUser = new User
            {
                Username = "admin",
                PasswordHash = passwordHash,
                RoleId = masterRole.Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                IsDeleted = false,
                Email = "admin@econnectone.local",
                FullName = "System Administrator"
            };

            dbContext.Users.Add(adminUser);
            dbContext.SaveChanges();

            Console.WriteLine("✅ Seeded default admin user: admin / admin123");
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine($"⚠️ Startup seeding warning: {ex.Message}");
}

app.Run();
