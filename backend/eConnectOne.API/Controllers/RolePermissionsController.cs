using eConnectOne.API.DTOs;
using eConnectOne.API.Data;
using eConnectOne.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace eConnectOne.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Master Admin")]
    public class RolePermissionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RolePermissionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RolePermissionDto>>> GetRolePermissions()
        {
            var permissions = await _context.RolePermissions
                .Include(rp => rp.Role)
                .Where(rp => !rp.IsDeleted)
                .Select(rp => new RolePermissionDto
                {
                    Id = rp.Id,
                    RoleId = rp.RoleId,
                    RoleName = rp.Role!.Name,
                    Permission = rp.Permission,
                    CanView = rp.CanView,
                    CanCreate = rp.CanCreate,
                    CanEdit = rp.CanEdit,
                    CanDelete = rp.CanDelete
                })
                .ToListAsync();

            return Ok(permissions);
        }

        [HttpPost]
        public async Task<ActionResult<RolePermissionDto>> CreateRolePermission(UpdateRolePermissionDto dto)
        {
            // Check if permission already exists for this role
            var existingPermission = await _context.RolePermissions
                .FirstOrDefaultAsync(rp => rp.RoleId == dto.RoleId && rp.Permission == dto.Permission && !rp.IsDeleted);
            
            if (existingPermission != null)
            {
                return BadRequest($"Permission '{dto.Permission}' already exists for this role.");
            }

            var rolePermission = new RolePermission
            {
                RoleId = dto.RoleId,
                Permission = dto.Permission,
                CanView = dto.CanView,
                CanCreate = dto.CanCreate,
                CanEdit = dto.CanEdit,
                CanDelete = dto.CanDelete,
                CreatedDate = DateTime.UtcNow,
                IsDeleted = false
            };

            _context.RolePermissions.Add(rolePermission);
            await _context.SaveChangesAsync();

            var result = await _context.RolePermissions
                .Include(rp => rp.Role)
                .Where(rp => rp.Id == rolePermission.Id)
                .Select(rp => new RolePermissionDto
                {
                    Id = rp.Id,
                    RoleId = rp.RoleId,
                    RoleName = rp.Role!.Name,
                    Permission = rp.Permission,
                    CanView = rp.CanView,
                    CanCreate = rp.CanCreate,
                    CanEdit = rp.CanEdit,
                    CanDelete = rp.CanDelete
                })
                .FirstAsync();

            return CreatedAtAction(nameof(GetRolePermissions), result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<RolePermissionDto>> UpdateRolePermission(int id, UpdateRolePermissionDto dto)
        {
            var rolePermission = await _context.RolePermissions.FindAsync(id);
            if (rolePermission == null || rolePermission.IsDeleted)
            {
                return NotFound();
            }

            rolePermission.CanView = dto.CanView;
            rolePermission.CanCreate = dto.CanCreate;
            rolePermission.CanEdit = dto.CanEdit;
            rolePermission.CanDelete = dto.CanDelete;
            rolePermission.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var result = await _context.RolePermissions
                .Include(rp => rp.Role)
                .Where(rp => rp.Id == id)
                .Select(rp => new RolePermissionDto
                {
                    Id = rp.Id,
                    RoleId = rp.RoleId,
                    RoleName = rp.Role!.Name,
                    Permission = rp.Permission,
                    CanView = rp.CanView,
                    CanCreate = rp.CanCreate,
                    CanEdit = rp.CanEdit,
                    CanDelete = rp.CanDelete
                })
                .FirstAsync();

            return Ok(result);
        }

        [HttpGet("user-permissions")]
        [AllowAnonymous] // Allow all authenticated users
        public async Task<ActionResult<Dictionary<string, object>>> GetUserPermissions()
        {
            // Check if user is authenticated
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var userIdClaim = User.FindFirst("id")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Invalid user ID claim" });
            }

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);

            if (user == null)
            {
                return NotFound();
            }

            var permissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == user.RoleId && !rp.IsDeleted)
                .ToDictionaryAsync(
                    rp => rp.Permission,
                    rp => new { rp.CanView, rp.CanCreate, rp.CanEdit, rp.CanDelete }
                );

            return Ok(permissions);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRolePermission(int id)
        {
            var rolePermission = await _context.RolePermissions.FindAsync(id);
            if (rolePermission == null || rolePermission.IsDeleted)
            {
                return NotFound();
            }

            // Soft delete
            rolePermission.IsDeleted = true;
            rolePermission.UpdatedDate = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }

        [HttpGet("available-permissions")]
        public ActionResult<IEnumerable<string>> GetAvailablePermissions()
        {
            var permissions = new List<string>
            {
                "Dashboard",
                "UserManagement", 
                "TicketManagement",
                "AuditLogs",
                "SystemSettings",
                "Reports",
                "CSPManagement"
            };
            
            return Ok(permissions);
        }
    }
}