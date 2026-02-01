
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eConnectOne.API.Data;
using eConnectOne.API.DTOs;
using eConnectOne.API.Models;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace eConnectOne.API.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserResponseDto>> GetUsersByRoleAsync(int? roleId = null)
        {
            // Optimized: Load all users with role data in single query
            var query = _context.Users
                .Include(u => u.Role)
                .Where(u => !u.IsDeleted);

            if (roleId.HasValue)
            {
                query = query.Where(u => u.RoleId == roleId.Value);
            }

            var users = await query.ToListAsync();

            // Map to DTOs using pre-loaded role data
            var userIds = users.Select(u => u.Id).ToList();
            var generalDetails = await _context.GeneralUserDetails
                .Where(g => userIds.Contains(g.UserId))
                .ToListAsync();
            var userDetails = await _context.UserDetails
                .Where(u => userIds.Contains(u.UserId))
                .ToListAsync();

            return users.Select(u => MapUserToResponseDto(u, 
                generalDetails.FirstOrDefault(g => g.UserId == u.Id),
                userDetails.FirstOrDefault(ud => ud.UserId == u.Id))).ToList();
        }

        private UserResponseDto MapUserToResponseDto(User user, GeneralUserDetails? generalDetails = null, UserDetails? userDetails = null)
        {
            var roleName = user.Role?.Name ?? "Unknown";

            var responseDto = new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                MobileNumber = user.MobileNumber,
                EmergencyContactNumber = user.EmergencyContactNumber,
                FatherName = user.FatherName,
                MotherName = user.MotherName,
                RoleName = roleName,
                RoleId = user.RoleId,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            };

            // Include GeneralUserDetails if applicable
            if (roleName != "CSP" && generalDetails != null)
            {
                responseDto.GeneralDetails = new GeneralUserDetailDto
                {
                    Id = generalDetails.Id,
                    Address = generalDetails.Address,
                    Qualification = generalDetails.Qualification,
                    ProfilePicSource = generalDetails.ProfilePicSource,
                    CityId = generalDetails.CityId,
                    StateId = generalDetails.StateId,
                    DepartmentId = generalDetails.DepartmentId,
                    DesignationId = generalDetails.DesignationId
                };
            }
            else if (roleName == "CSP" && userDetails != null)
            {
                responseDto.UserDetails = new UserDetailDto
                {
                    Id = userDetails.Id,
                    UserId = userDetails.UserId,
                    Name = userDetails.Name,
                    Code = userDetails.Code,
                    BranchCode = userDetails.BranchCode,
                    ExpiryDate = userDetails.ExpiryDate,
                    BankName = userDetails.BankName,
                    BankAccount = userDetails.BankAccount,
                    IFSC = userDetails.IFSC,
                    CertificateStatus = userDetails.CertificateStatus,
                    StatusId = userDetails.StatusId,
                    CountryId = userDetails.CountryId,
                    StateId = userDetails.StateId,
                    CityId = userDetails.CityId,
                    LocationId = userDetails.LocationId,
                    Category = userDetails.Category,
                    PAN = userDetails.PAN,
                    VoterId = userDetails.VoterId,
                    AadharNo = userDetails.AadharNo,
                    Education = userDetails.Education
                };
            }

            return responseDto;
        }

        public async Task<UserResponseDto> CreateUserAsync(UserCreateDto userDto)
        {
            // Always use the provided username, do not overwrite
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.Id == userDto.RoleId);
            var roleName = role?.Name;

            // For CSP, Username = CSPCode (enforced)
            string username = userDto.Username;
            string? cspCode = userDto.CSPCode;
            if (roleName == "CSP")
            {
                if (string.IsNullOrWhiteSpace(cspCode))
                    throw new ArgumentException("Code is required for CSP users.");
                username = cspCode;
            }

            var user = new User
            {
                Username = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(userDto.Password),
                RoleId = userDto.RoleId,
                Email = userDto.Email,
                FullName = userDto.FullName,
                MobileNumber = userDto.MobileNumber,
                EmergencyContactNumber = userDto.EmergencyContactNumber,
                FatherName = userDto.FatherName,
                MotherName = userDto.MotherName,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                IsDeleted = false,
                Role = role  // Set the role relation to avoid additional query
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create associated detail record based on role
            GeneralUserDetails? generalDetails = null;
            UserDetails? userDetails = null;

            if (roleName == "CSP")
            {
                userDetails = new UserDetails { UserId = user.Id, Code = cspCode!, CreatedDate = DateTime.UtcNow };
                _context.UserDetails.Add(userDetails);
            }
            else
            {
                generalDetails = new GeneralUserDetails { UserId = user.Id, CreatedDate = DateTime.UtcNow };
                _context.GeneralUserDetails.Add(generalDetails);
            }
            await _context.SaveChangesAsync();

            return MapUserToResponseDto(user, generalDetails, userDetails);
        }

        public async Task<UserResponseDto?> GetUserByIdAsync(int id)
        {
            var user = await _context.Users
                                     .Include(u => u.Role)
                                     .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);

            if (user == null)
            {
                return null;
            }

            // Load related details
            var generalDetails = await _context.GeneralUserDetails
                .FirstOrDefaultAsync(g => g.UserId == user.Id);
            var userDetails = await _context.UserDetails
                .FirstOrDefaultAsync(ud => ud.UserId == user.Id);

            return MapUserToResponseDto(user, generalDetails, userDetails);
        }

        public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync(int pageNumber, int pageSize, int? currentUserId = null, string? currentUserRole = null)
        {
            var query = _context.Users
                .Include(u => u.Role)
                .Where(u => !u.IsDeleted);

            if (currentUserRole == "CSP" && currentUserId.HasValue)
            {
                query = query.Where(u => u.Id == currentUserId.Value);
            }

            var users = await query
                .OrderBy(u => u.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Load all details in batch (efficient N+1 prevention)
            var userIds = users.Select(u => u.Id).ToList();
            var generalDetails = await _context.GeneralUserDetails
                .Where(g => userIds.Contains(g.UserId))
                .ToListAsync();
            var userDetails = await _context.UserDetails
                .Where(u => userIds.Contains(u.UserId))
                .ToListAsync();

            // Map to DTOs using pre-loaded data
            return users.Select(u => MapUserToResponseDto(u,
                generalDetails.FirstOrDefault(g => g.UserId == u.Id),
                userDetails.FirstOrDefault(ud => ud.UserId == u.Id))).ToList();
        }

        public async Task<UserResponseDto> UpdateUserAsync(int id, UserUpdateDto userDto)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);

            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {id} not found.");
            }
            // Username removed, do not update
            if (!string.IsNullOrEmpty(userDto.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(userDto.Password);
            }
            user.RoleId = userDto.RoleId ?? user.RoleId;
            user.Email = userDto.Email ?? user.Email;
            user.FullName = userDto.FullName ?? user.FullName;
            user.MobileNumber = userDto.MobileNumber ?? user.MobileNumber;
            user.EmergencyContactNumber = userDto.EmergencyContactNumber ?? user.EmergencyContactNumber;
            user.FatherName = userDto.FatherName ?? user.FatherName;
            user.MotherName = userDto.MotherName ?? user.MotherName;
            user.IsActive = userDto.IsActive ?? user.IsActive;
            user.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Load related details
            var generalDetails = await _context.GeneralUserDetails
                .FirstOrDefaultAsync(g => g.UserId == user.Id);
            var userDetails = await _context.UserDetails
                .FirstOrDefaultAsync(ud => ud.UserId == user.Id);

            return MapUserToResponseDto(user, generalDetails, userDetails);
        }

        public async Task<UserResponseDto> UpdateGeneralUserDetailsAsync(int userId, GeneralUserDetailDto detailsDto)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);

            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {userId} not found.");
            }
            var generalDetails = await _context.GeneralUserDetails.FirstOrDefaultAsync(g => g.UserId == user.Id && !g.IsDeleted);

            if (generalDetails == null)
            {
                generalDetails = new GeneralUserDetails { UserId = user.Id, CreatedDate = DateTime.UtcNow };
                _context.GeneralUserDetails.Add(generalDetails);
            }
            generalDetails.Address = detailsDto.Address ?? generalDetails.Address;
            generalDetails.Qualification = detailsDto.Qualification ?? generalDetails.Qualification;
            generalDetails.ProfilePicSource = detailsDto.ProfilePicSource ?? generalDetails.ProfilePicSource;
            generalDetails.CityId = detailsDto.CityId ?? generalDetails.CityId;
            generalDetails.StateId = detailsDto.StateId ?? generalDetails.StateId;
            generalDetails.DepartmentId = detailsDto.DepartmentId ?? generalDetails.DepartmentId;
            generalDetails.DesignationId = detailsDto.DesignationId ?? generalDetails.DesignationId;
            generalDetails.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Load user details as well
            var userDetails = await _context.UserDetails
                .FirstOrDefaultAsync(ud => ud.UserId == user.Id);

            return MapUserToResponseDto(user, generalDetails, userDetails);
        }

    public async Task<UserResponseDto> UpdateUserDetailsAsync(int userId, UserDetailDto detailsDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {userId} not found.");
            }
            var userDetails = await _context.UserDetails.FirstOrDefaultAsync(c => c.UserId == user.Id && !c.IsDeleted);
            if (userDetails == null)
            {
                userDetails = new UserDetails { UserId = user.Id, CreatedDate = DateTime.UtcNow };
                _context.UserDetails.Add(userDetails);
            }
            userDetails.Name = detailsDto.Name ?? userDetails.Name;
            userDetails.Code = detailsDto.Code ?? userDetails.Code;
            userDetails.BranchCode = detailsDto.BranchCode ?? userDetails.BranchCode;
            userDetails.ExpiryDate = detailsDto.ExpiryDate ?? userDetails.ExpiryDate;
            userDetails.BankName = detailsDto.BankName ?? userDetails.BankName;
            userDetails.BankAccount = detailsDto.BankAccount ?? userDetails.BankAccount;
            userDetails.IFSC = detailsDto.IFSC ?? userDetails.IFSC;
            userDetails.CertificateStatus = detailsDto.CertificateStatus ?? userDetails.CertificateStatus;
            userDetails.StatusId = detailsDto.StatusId ?? userDetails.StatusId;
            userDetails.CountryId = detailsDto.CountryId ?? userDetails.CountryId;
            userDetails.StateId = detailsDto.StateId ?? userDetails.StateId;
            userDetails.CityId = detailsDto.CityId ?? userDetails.CityId;
            userDetails.LocationId = detailsDto.LocationId ?? userDetails.LocationId;
            userDetails.Category = detailsDto.Category ?? userDetails.Category;
            userDetails.PAN = detailsDto.PAN ?? userDetails.PAN;
            userDetails.VoterId = detailsDto.VoterId ?? userDetails.VoterId;
            userDetails.AadharNo = detailsDto.AadharNo ?? userDetails.AadharNo;
            userDetails.Education = detailsDto.Education ?? userDetails.Education;
            userDetails.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return MapUserToResponseDto(user);
        }

        public async Task<bool> SoftDeleteUserAsync(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
            if (user == null)
            {
                return false;
            }
            user.IsDeleted = true;
            user.DeletedDate = DateTime.UtcNow;
            user.UpdatedDate = DateTime.UtcNow;
            var roleName = await _context.Roles.Where(r => r.Id == user.RoleId).Select(r => r.Name).FirstOrDefaultAsync();
            if (roleName == "CSP")
            {
                var userDetails = await _context.UserDetails.FirstOrDefaultAsync(c => c.UserId == user.Id && !c.IsDeleted);
                if (userDetails != null)
                {
                    userDetails.IsDeleted = true;
                    userDetails.DeletedDate = DateTime.UtcNow;
                    userDetails.UpdatedDate = DateTime.UtcNow;
                    var userDocuments = await _context.UserDocuments.Where(d => d.Code == userDetails.Code && !d.IsDeleted).ToListAsync();
                    foreach (var doc in userDocuments)
                    {
                        doc.IsDeleted = true;
                        doc.DeletedDate = DateTime.UtcNow;
                    }
                }
            }
            else
            {
                var generalDetails = await _context.GeneralUserDetails.FirstOrDefaultAsync(g => g.UserId == user.Id && !g.IsDeleted);
                if (generalDetails != null)
                {
                    generalDetails.IsDeleted = true;
                    generalDetails.DeletedDate = DateTime.UtcNow;
                    generalDetails.UpdatedDate = DateTime.UtcNow;
                }
            }
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RestoreUserAsync(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && u.IsDeleted);
            if (user == null)
            {
                return false;
            }
            user.IsDeleted = false;
            user.DeletedDate = null;
            user.UpdatedDate = DateTime.UtcNow;
            var roleName = await _context.Roles.Where(r => r.Id == user.RoleId).Select(r => r.Name).FirstOrDefaultAsync();
            if (roleName == "CSP")
            {
                var userDetails = await _context.UserDetails.FirstOrDefaultAsync(c => c.UserId == user.Id && c.IsDeleted);
                if (userDetails != null)
                {
                    userDetails.IsDeleted = false;
                    userDetails.DeletedDate = null;
                    userDetails.UpdatedDate = DateTime.UtcNow;
                    var userDocuments = await _context.UserDocuments.Where(d => d.Code == userDetails.Code && d.IsDeleted).ToListAsync();
                    foreach (var doc in userDocuments)
                    {
                        doc.IsDeleted = false;
                        doc.DeletedDate = null;
                    }
                }
            }
            else
            {
                var generalDetails = await _context.GeneralUserDetails.FirstOrDefaultAsync(g => g.UserId == user.Id && g.IsDeleted);
                if (generalDetails != null)
                {
                    generalDetails.IsDeleted = false;
                    generalDetails.DeletedDate = null;
                    generalDetails.UpdatedDate = DateTime.UtcNow;
                }
            }
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ResetPasswordAsync(int userId, string newPassword)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);
            if (user == null)
            {
                return false;
            }
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<UserFullDetailsDto>> GetAllUsersWithFullDetailsAsync()
        {
            var users = await _context.Users.Where(u => !u.IsDeleted).OrderBy(u => u.Id).Include(u => u.Role).ToListAsync();
            var result = new List<UserFullDetailsDto>();
            foreach (var user in users)
            {
                var roleName = user.Role?.Name ?? "Unknown";
                var fullDetails = new UserFullDetailsDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    FullName = user.FullName,
                    MobileNumber = user.MobileNumber,
                    EmergencyContactNumber = user.EmergencyContactNumber,
                    FatherName = user.FatherName,
                    MotherName = user.MotherName,
                    RoleName = roleName,
                    RoleId = user.RoleId,
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt,
                    LastLoginAt = user.LastLoginAt
                };

                if (roleName != "CSP")
                {
                    fullDetails.GeneralDetails = await _context.GeneralUserDetails
                        .Where(g => g.UserId == user.Id && !g.IsDeleted)
                        .Select(g => new GeneralUserDetailDto
                        {
                            Id = g.Id,
                            Address = g.Address,
                            Qualification = g.Qualification,
                            ProfilePicSource = g.ProfilePicSource,
                            CityId = g.CityId,
                            StateId = g.StateId,
                            DepartmentId = g.DepartmentId,
                            DesignationId = g.DesignationId
                        })
                        .FirstOrDefaultAsync();
                }
                else
                {
                    fullDetails.UserDetails = await _context.UserDetails
                        .Where(c => c.UserId == user.Id && !c.IsDeleted)
                        .Select(c => new UserDetailDto
                        {
                            Id = c.Id,
                            UserId = c.UserId,
                            Name = c.Name,
                            Code = c.Code,
                            BranchCode = c.BranchCode,
                            ExpiryDate = c.ExpiryDate,
                            BankName = c.BankName,
                            BankAccount = c.BankAccount,
                            IFSC = c.IFSC,
                            CertificateStatus = c.CertificateStatus,
                            StatusId = c.StatusId,
                            CountryId = c.CountryId,
                            StateId = c.StateId,
                            CityId = c.CityId,
                            LocationId = c.LocationId,
                            Category = c.Category,
                            PAN = c.PAN,
                            VoterId = c.VoterId,
                            AadharNo = c.AadharNo,
                            Education = c.Education
                        })
                        .FirstOrDefaultAsync();

                    fullDetails.Documents = await _context.UserDocuments
                        .Where(d => d.UserId == user.Id && !d.IsDeleted)
                        .Select(d => new UserDocumentDto
                        {
                            Id = d.Id,
                            Code = d.Code,
                            DocumentType = d.DocumentType,
                            DocumentPath = d.DocumentPath,
                            UploadedDate = d.UploadedDate
                        })
                        .ToListAsync();
                }
                result.Add(fullDetails);
            }
            return result;
        }
    }
}
