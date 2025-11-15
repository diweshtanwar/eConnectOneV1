using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using eConnectOne.API.Data;
using eConnectOne.API.Models;
using Microsoft.AspNetCore.Authorization;

namespace eConnectOne.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ResourceCenterController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ResourceCenterController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("categories")]
        public async Task<ActionResult> GetCategories()
        {
            var categories = await _context.ResourceCategories
                .Where(c => c.IsActive)
                .OrderBy(c => c.SortOrder)
                .Select(c => new {
                    c.Id,
                    c.Name,
                    c.Description,
                    c.Icon,
                    c.Color,
                    ResourceCount = c.Resources.Count(r => r.IsActive)
                })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet("resources")]
        public async Task<ActionResult> GetResources([FromQuery] int? categoryId, [FromQuery] string? search)
        {
            var userRole = GetCurrentUserRole();
            
            var query = _context.Resources
                .Include(r => r.Category)
                .Include(r => r.UploadedByUser)
                .Where(r => r.IsActive && 
                           (r.TargetRoles == "All" || r.TargetRoles.Contains(userRole)));

            if (categoryId.HasValue)
            {
                query = query.Where(r => r.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(r => r.Title.Contains(search) || r.Description.Contains(search));
            }

            var resources = await query
                .OrderByDescending(r => r.IsFeatured)
                .ThenByDescending(r => r.CreatedAt)
                .Select(r => new {
                    r.Id,
                    r.Title,
                    r.Description,
                    r.ResourceType,
                    r.ExternalUrl,
                    r.FileName,
                    r.FileSize,
                    r.Priority,
                    r.IsFeatured,
                    r.DownloadCount,
                    r.ViewCount,
                    r.CreatedAt,
                    Category = r.Category!.Name,
                    UploadedBy = r.UploadedByUser!.FullName ?? r.UploadedByUser.Username
                })
                .ToListAsync();

            return Ok(resources);
        }

        [HttpPost("categories")]
        [Authorize(Roles = "Admin,Master Admin")]
        public async Task<ActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            var category = new ResourceCategory
            {
                Name = dto.Name,
                Description = dto.Description,
                Icon = dto.Icon ?? "Folder",
                Color = dto.Color ?? "primary",
                SortOrder = dto.SortOrder
            };

            _context.ResourceCategories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Category created successfully", id = category.Id });
        }

        [HttpPost("resources")]
        [Authorize(Roles = "Admin,Master Admin")]
        public async Task<ActionResult> CreateResource([FromBody] CreateResourceDto dto)
        {
            var userId = GetCurrentUserId();
            
            var resource = new Resource
            {
                Title = dto.Title,
                Description = dto.Description,
                ResourceType = dto.ResourceType,
                ExternalUrl = dto.ExternalUrl,
                CategoryId = dto.CategoryId,
                TargetRoles = dto.TargetRoles ?? "All",
                Priority = dto.Priority ?? "Normal",
                UploadedByUserId = userId,
                IsFeatured = dto.IsFeatured
            };

            _context.Resources.Add(resource);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Resource created successfully", id = resource.Id });
        }

        [HttpPost("resources/{id}/access")]
        public async Task<ActionResult> TrackAccess(int id, [FromBody] TrackAccessDto dto)
        {
            var userId = GetCurrentUserId();
            var resource = await _context.Resources.FindAsync(id);
            
            if (resource == null || !resource.IsActive) return NotFound();

            // Track access
            var access = new ResourceAccess
            {
                ResourceId = id,
                UserId = userId,
                AccessType = dto.AccessType,
                UserAgent = Request.Headers["User-Agent"].ToString(),
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
            };

            _context.ResourceAccesses.Add(access);

            // Update counters
            if (dto.AccessType == "View")
            {
                resource.ViewCount++;
            }
            else if (dto.AccessType == "Download")
            {
                resource.DownloadCount++;
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("featured")]
        public async Task<ActionResult> GetFeaturedResources()
        {
            var userRole = GetCurrentUserRole();
            
            var resources = await _context.Resources
                .Include(r => r.Category)
                .Where(r => r.IsActive && r.IsFeatured && 
                           (r.TargetRoles == "All" || r.TargetRoles.Contains(userRole)))
                .OrderByDescending(r => r.CreatedAt)
                .Take(6)
                .Select(r => new {
                    r.Id,
                    r.Title,
                    r.Description,
                    r.ResourceType,
                    r.Priority,
                    Category = r.Category!.Name,
                    CategoryColor = r.Category.Color
                })
                .ToListAsync();

            return Ok(resources);
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 1;
        }

        private string GetCurrentUserRole()
        {
            return User.FindFirst("role")?.Value ?? "CSP";
        }
    }

    public class CreateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public int SortOrder { get; set; } = 0;
    }

    public class CreateResourceDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ResourceType { get; set; } = "Link";
        public string? ExternalUrl { get; set; }
        public int CategoryId { get; set; }
        public string? TargetRoles { get; set; }
        public string? Priority { get; set; }
        public bool IsFeatured { get; set; } = false;
    }

    public class TrackAccessDto
    {
        public string AccessType { get; set; } = "View";
    }
}