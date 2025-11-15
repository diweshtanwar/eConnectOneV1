
using eConnectOne.API.Data;
using eConnectOne.API.DTOs;
using eConnectOne.API.Models;
using Microsoft.EntityFrameworkCore;

namespace eConnectOne.API.Services
{
	public class UserDocumentService : IUserDocumentService
	{
		private readonly ApplicationDbContext _context;

		public UserDocumentService(ApplicationDbContext context)
		{
			_context = context;
		}

		private static UserDocumentDto MapToDto(UserDocuments document)
		{
			return new UserDocumentDto
			{
				Id = document.Id,
				Code = document.Code,
				DocumentType = document.DocumentType,
				DocumentPath = document.DocumentPath,
				UploadedDate = document.UploadedDate
			};
		}

		public async Task<IEnumerable<UserDocumentDto>> GetAllUserDocumentsAsync()
		{
			return await _context.UserDocuments
				.Where(d => !d.IsDeleted)
				.Select(d => MapToDto(d))
				.ToListAsync();
		}

		public async Task<UserDocumentDto?> GetUserDocumentByIdAsync(int id)
		{
			var document = await _context.UserDocuments
				.FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);
			return document == null ? null : MapToDto(document);
		}

		public async Task<UserDocumentDto> CreateUserDocumentAsync(UserDocumentCreateDto documentDto)
		{
			var document = new UserDocuments
			{
				Code = documentDto.Code,
				DocumentType = documentDto.DocumentType ?? string.Empty,
				DocumentPath = documentDto.DocumentPath ?? string.Empty,
				UploadedDate = DateTime.UtcNow,
				CreatedDate = DateTime.UtcNow,
				IsDeleted = false
			};

			_context.UserDocuments.Add(document);
			await _context.SaveChangesAsync();
			return MapToDto(document);
		}

		public async Task<UserDocumentDto> UpdateUserDocumentAsync(int id, UserDocumentUpdateDto documentDto)
		{
			var document = await _context.UserDocuments
				.FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);

			if (document == null)
			{
				throw new KeyNotFoundException($"User Document with ID {id} not found.");
			}

			document.DocumentType = documentDto.DocumentType ?? document.DocumentType;
			document.DocumentPath = documentDto.DocumentPath ?? document.DocumentPath;
			document.UpdatedDate = DateTime.UtcNow;

			await _context.SaveChangesAsync();
			return MapToDto(document);
		}

		public async Task<bool> DeleteUserDocumentAsync(int id)
		{
			var document = await _context.UserDocuments
				.FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);
			if (document == null)
			{
				return false;
			}

			document.IsDeleted = true;
			document.DeletedDate = DateTime.UtcNow;
			document.UpdatedDate = DateTime.UtcNow;

			await _context.SaveChangesAsync();
			return true;
		}
	}
}
