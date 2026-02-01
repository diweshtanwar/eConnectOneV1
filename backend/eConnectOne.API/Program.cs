using System.Text;
using eConnectOne.API.Data;
using eConnectOne.API.Services;
using eConnectOne.API.Services.Tickets; // Added for new services
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Try to get DATABASE_URL from environment first (for Supabase/Render)
// If not found, fall back to appsettings connection string for local development
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") 
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

Console.WriteLine(string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DATABASE_URL")) 
    ? "Using local connection string from appsettings" 
    : "Using Supabase DATABASE_URL from environment");

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();


// Register new Ticket Management Services
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<IAttachmentService, AttachmentService>();
builder.Services.AddScoped<IWalletService, WalletService>();
builder.Services.AddScoped<IFraudDetectionService, FraudDetectionService>();
builder.Services.AddScoped<IReconciliationService, ReconciliationService>();
builder.Services.AddScoped<ILimitValidationService, LimitValidationService>();
builder.Services.AddScoped<ICommissionService, CommissionService>();
builder.Services.AddScoped<IEnhancedAuditLogService, EnhancedAuditLogService>();

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
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
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
