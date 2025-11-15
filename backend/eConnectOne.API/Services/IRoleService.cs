using eConnectOne.API.DTOs;

namespace eConnectOne.API.Services
{
    public interface IRoleService
    {
        Task<IEnumerable<RoleDto>> GetAllRolesAsync();
    }
}
