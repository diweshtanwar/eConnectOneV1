using eConnectOne.API.Data;
using eConnectOne.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace eConnectOne.API.Services
{
    public class RoleService : IRoleService
    {
        private readonly ApplicationDbContext _context;

        public RoleService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RoleDto>> GetAllRolesAsync()
        {
            return await _context.Roles
                                 .Select(r => new RoleDto { Id = r.Id, Name = r.Name })
                                 .ToListAsync();
        }
    }
}
