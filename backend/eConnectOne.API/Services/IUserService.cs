using eConnectOne.API.DTOs;
using eConnectOne.API.Models; // For User model

namespace eConnectOne.API.Services
{
    public interface IUserService
    {
        Task<UserResponseDto> CreateUserAsync(UserCreateDto userDto);
        Task<UserResponseDto?> GetUserByIdAsync(int id);
        Task<IEnumerable<UserResponseDto>> GetAllUsersAsync(int pageNumber, int pageSize, int? currentUserId = null, string? currentUserRole = null);
        Task<UserResponseDto> UpdateUserAsync(int id, UserUpdateDto userDto);
        Task<UserResponseDto> UpdateGeneralUserDetailsAsync(int userId, GeneralUserDetailDto detailsDto);
    Task<UserResponseDto> UpdateUserDetailsAsync(int userId, UserDetailDto detailsDto);
        Task<bool> SoftDeleteUserAsync(int id);
        Task<bool> RestoreUserAsync(int id);
        Task<bool> ResetPasswordAsync(int userId, string newPassword);
    Task<IEnumerable<UserResponseDto>> GetUsersByRoleAsync(int? roleId = null);
    Task<IEnumerable<UserFullDetailsDto>> GetAllUsersWithFullDetailsAsync();
    }
}
