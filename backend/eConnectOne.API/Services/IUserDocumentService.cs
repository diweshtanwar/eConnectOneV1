using eConnectOne.API.DTOs;
namespace eConnectOne.API.Services
{
	public interface IUserDocumentService
	{
		Task<IEnumerable<UserDocumentDto>> GetAllUserDocumentsAsync();
		Task<UserDocumentDto?> GetUserDocumentByIdAsync(int id);
		Task<UserDocumentDto> CreateUserDocumentAsync(UserDocumentCreateDto documentDto);
		Task<UserDocumentDto> UpdateUserDocumentAsync(int id, UserDocumentUpdateDto documentDto);
		Task<bool> DeleteUserDocumentAsync(int id);
	}
}
