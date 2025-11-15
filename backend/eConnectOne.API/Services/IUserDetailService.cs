using eConnectOne.API.DTOs;
namespace eConnectOne.API.Services
{
	public interface IUserDetailService
	{
		Task<IEnumerable<UserDetailDto>> GetAllUserDetailsAsync();
		Task<UserDetailDto?> GetUserDetailByIdAsync(int id);
		Task<UserDetailDto> CreateUserDetailAsync(UserDetailDto userDetailDto);
		Task<UserDetailDto> UpdateUserDetailAsync(int id, UserDetailDto userDetailDto);
		Task<bool> DeleteUserDetailAsync(int id);
	}
}
