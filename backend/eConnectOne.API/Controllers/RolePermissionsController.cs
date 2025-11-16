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
            try
            {
                // Check if permission already exists for this role (including soft-deleted)
                var existingPermission = await _context.RolePermissions
                    .FirstOrDefaultAsync(rp => rp.RoleId == dto.RoleId && rp.Permission == dto.Permission);
                
                if (existingPermission != null)
                {
                    if (existingPermission.IsDeleted)
                    {
                        // Restore soft-deleted permission
                        existingPermission.IsDeleted = false;
                        existingPermission.CanView = dto.CanView;
                        existingPermission.CanCreate = dto.CanCreate;
                        existingPermission.CanEdit = dto.CanEdit;
                        existingPermission.CanDelete = dto.CanDelete;
                        existingPermission.UpdatedDate = DateTime.UtcNow;
                        
                        await _context.SaveChangesAsync();
                        
                        var restoredResult = await _context.RolePermissions
                            .Include(rp => rp.Role)
                            .Where(rp => rp.Id == existingPermission.Id)
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
                        
                        return Ok(restoredResult);
                    }
                    else
                    {
                        return BadRequest(new { message = $"Permission '{dto.Permission}' already exists for this role." });
                    }
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
            catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("duplicate key") == true)
            {
                return BadRequest(new { message = "This permission already exists for the selected role. Please refresh the page and try again." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the permission.", error = ex.Message });
            }
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
                "BroadcastManagement",
                "CommissionManagement",
                "Messages",
                "ResourceCenter",
                "WalletManagement"
            };
            
            return Ok(permissions);
        }
    }
}