
using eConnectOne.API.Data;
using eConnectOne.API.DTOs;
using eConnectOne.API.Models;
using Microsoft.EntityFrameworkCore;

namespace eConnectOne.API.Services
{
	public class UserDetailService : IUserDetailService
	{
		private readonly ApplicationDbContext _context;

		public UserDetailService(ApplicationDbContext context)
		{
			_context = context;
		}

		private static UserDetailDto MapToDto(UserDetails userDetail)
		{
			return new UserDetailDto
			{
				Id = userDetail.Id,
				UserId = userDetail.UserId,
				Name = userDetail.Name,
				Code = userDetail.Code,
				BranchCode = userDetail.BranchCode,
				ExpiryDate = userDetail.ExpiryDate,
				BankName = userDetail.BankName,
				BankAccount = userDetail.BankAccount,
				IFSC = userDetail.IFSC,
				CertificateStatus = userDetail.CertificateStatus,
				StatusId = userDetail.StatusId,
				CountryId = userDetail.CountryId,
				StateId = userDetail.StateId,
				CityId = userDetail.CityId,
				LocationId = userDetail.LocationId,
				Category = userDetail.Category,
				PAN = userDetail.PAN,
				VoterId = userDetail.VoterId,
				AadharNo = userDetail.AadharNo,
				Education = userDetail.Education
			};
		}

		public async Task<IEnumerable<UserDetailDto>> GetAllUserDetailsAsync()
		{
			return await _context.UserDetails
				.Where(d => !d.IsDeleted)
				.Select(d => MapToDto(d))
				.ToListAsync();
		}

		public async Task<UserDetailDto?> GetUserDetailByIdAsync(int id)
		{
			var userDetail = await _context.UserDetails
				.FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);
			return userDetail == null ? null : MapToDto(userDetail);
		}

		public async Task<UserDetailDto> CreateUserDetailAsync(UserDetailDto userDetailDto)
		{
			var userDetail = new UserDetails
			{
				UserId = userDetailDto.UserId,
				Name = userDetailDto.Name,
				Code = userDetailDto.Code ?? string.Empty,
				BranchCode = userDetailDto.BranchCode,
				ExpiryDate = userDetailDto.ExpiryDate,
				BankName = userDetailDto.BankName,
				BankAccount = userDetailDto.BankAccount,
				IFSC = userDetailDto.IFSC,
				CertificateStatus = userDetailDto.CertificateStatus,
				StatusId = userDetailDto.StatusId,
				CountryId = userDetailDto.CountryId,
				StateId = userDetailDto.StateId,
				CityId = userDetailDto.CityId,
				LocationId = userDetailDto.LocationId,
				Category = userDetailDto.Category,
				PAN = userDetailDto.PAN,
				VoterId = userDetailDto.VoterId,
				AadharNo = userDetailDto.AadharNo,
				Education = userDetailDto.Education,
				CreatedDate = DateTime.UtcNow,
				IsDeleted = false
			};

			_context.UserDetails.Add(userDetail);
			await _context.SaveChangesAsync();
			return MapToDto(userDetail);
		}

		public async Task<UserDetailDto> UpdateUserDetailAsync(int id, UserDetailDto userDetailDto)
		{
			var userDetail = await _context.UserDetails
				.FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);

			if (userDetail == null)
			{
				throw new KeyNotFoundException($"User Detail with ID {id} not found.");
			}

			userDetail.Name = userDetailDto.Name;
			userDetail.Code = userDetailDto.Code ?? userDetail.Code;
			userDetail.BranchCode = userDetailDto.BranchCode;
			userDetail.ExpiryDate = userDetailDto.ExpiryDate;
			userDetail.BankName = userDetailDto.BankName;
			userDetail.BankAccount = userDetailDto.BankAccount;
			userDetail.IFSC = userDetailDto.IFSC;
			userDetail.CertificateStatus = userDetailDto.CertificateStatus;
			userDetail.StatusId = userDetailDto.StatusId;
			userDetail.CountryId = userDetailDto.CountryId;
			userDetail.StateId = userDetailDto.StateId;
			userDetail.CityId = userDetailDto.CityId;
			userDetail.LocationId = userDetailDto.LocationId;
			userDetail.Category = userDetailDto.Category;
			userDetail.PAN = userDetailDto.PAN;
			userDetail.VoterId = userDetailDto.VoterId;
			userDetail.AadharNo = userDetailDto.AadharNo;
			userDetail.Education = userDetailDto.Education;
			userDetail.UpdatedDate = DateTime.UtcNow;

			await _context.SaveChangesAsync();
			return MapToDto(userDetail);
		}

		public async Task<bool> DeleteUserDetailAsync(int id)
		{
			var userDetail = await _context.UserDetails
				.FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);
			if (userDetail == null)
			{
				return false;
			}

			userDetail.IsDeleted = true;
			userDetail.DeletedDate = DateTime.UtcNow;
			userDetail.UpdatedDate = DateTime.UtcNow;

			await _context.SaveChangesAsync();
			return true;
		}
	}
}
