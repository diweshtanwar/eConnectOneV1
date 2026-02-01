using System.Text;
using eConnectOne.API.Data;
using eConnectOne.API.Extensions;
using eConnectOne.API.Models.Configuration;
using eConnectOne.API.Services;
using eConnectOne.API.Services.Tickets;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Configure strongly-typed options from appsettings
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.Configure<DatabaseOptions>(builder.Configuration.GetSection("Database"));
builder.Services.Configure<CorsOptions>(builder.Configuration.GetSection("Cors"));

// Get DATABASE_URL from environment (supports Railway, Render, AWS, Azure)
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

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        builder =>
        {
            builder.WithOrigins(
                    "http://localhost:5173",           // Vite dev server
                    "http://localhost:5174",           // Vite dev server alt port
                    "http://localhost:3001",           // Alternative dev port
                    "https://diweshtanwar.github.io",  // GitHub Pages root
                    "https://diweshtanwar.github.io/eConnectOneV1"  // GitHub Pages subdirectory
                )
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
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
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

app.UseStaticFiles(); // Enable serving static files (e.g., attachments)

app.UseCors("AllowFrontend");

// Add rate limiting middleware (disabled for development)
// app.UseMiddleware<eConnectOne.API.Middleware.RateLimitingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Initialize database on startup
try
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        dbContext.Database.Migrate();
    }
}
catch (Exception)
{
    // Don't fail startup, continue
}

app.Run();
