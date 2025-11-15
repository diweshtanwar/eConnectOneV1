using eConnectOne.API.DTOs;
using eConnectOne.API.Data;
using eConnectOne.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using BCrypt.Net;

namespace eConnectOne.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Master Admin,Admin")]
    public class BulkImportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BulkImportController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("users")]
        public async Task<ActionResult<BulkImportResultDto>> ImportUsers(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            if (!file.FileName.EndsWith(".csv"))
                return BadRequest("Only CSV files are allowed");

            var result = new BulkImportResultDto();
            var logs = new List<ImportLogDto>();

            try
            {
                using var reader = new StreamReader(file.OpenReadStream());
                var csvContent = await reader.ReadToEndAsync();
                var lines = csvContent.Split('\n', StringSplitOptions.RemoveEmptyEntries);

                if (lines.Length < 2)
                {
                    return BadRequest("CSV file must contain header and at least one data row");
                }

                // Skip header row
                for (int i = 1; i < lines.Length; i++)
                {
                    var line = lines[i].Trim();
                    if (string.IsNullOrEmpty(line)) continue;

                    var log = await ProcessUserRow(line, i + 1);
                    logs.Add(log);
                    result.TotalRecords++;

                    if (log.Status == "Success")
                        result.SuccessCount++;
                    else
                        result.FailureCount++;
                }

                result.Logs = logs;
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error processing file: {ex.Message}");
            }
        }

        [HttpGet("sample-csv")]
        public IActionResult DownloadSampleCsv()
        {
            var csv = new StringBuilder();
            csv.AppendLine("Username,Password,Email,FullName,RoleName,MobileNumber,FatherName,MotherName");
            csv.AppendLine("john_doe,password123,john@example.com,John Doe,HO user,1234567890,John Sr,Jane Doe");
            csv.AppendLine("jane_smith,password456,jane@example.com,Jane Smith,CSP,0987654321,Robert Smith,Mary Smith");

            var bytes = Encoding.UTF8.GetBytes(csv.ToString());
            return File(bytes, "text/csv", "user_import_sample.csv");
        }

        private async Task<ImportLogDto> ProcessUserRow(string csvRow, int rowNumber)
        {
            var log = new ImportLogDto { RowNumber = rowNumber };
            try
            {
                var fields = csvRow.Split(',');
                if (fields.Length < 8)
                {
                    log.Status = "Failed";
                    log.ErrorMessage = "Insufficient columns in CSV row";
                    return log;
                }
                var username = fields[0].Trim();
                var password = fields[1].Trim();
                var email = fields[2].Trim();
                var fullName = fields[3].Trim();
                var roleName = fields[4].Trim();
                var mobileNumber = fields[5].Trim();
                var fatherName = fields[6].Trim();
                var motherName = fields[7].Trim();

                log.Email = email;
                log.Username = username;

                if (string.IsNullOrEmpty(username))
                {
                    log.Status = "Failed";
                    log.ErrorMessage = "Username is required";
                    return log;
                }
                if (string.IsNullOrEmpty(password))
                {
                    log.Status = "Failed";
                    log.ErrorMessage = "Password is required";
                    return log;
                }
                if (password.Length < 6)
                {
                    log.Status = "Failed";
                    log.ErrorMessage = "Password must be at least 6 characters";
                    return log;
                }
                // Check if username already exists
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == username && !u.IsDeleted);
                if (existingUser != null)
                {
                    log.Status = "Failed";
                    log.ErrorMessage = "Username already exists";
                    return log;
                }
                // Get role ID
                var role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == roleName && !r.IsDeleted);
                if (role == null)
                {
                    log.Status = "Failed";
                    log.ErrorMessage = $"Role '{roleName}' not found";
                    return log;
                }
                // Create user
                var user = new User
                {
                    Username = username,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                    Email = email,
                    FullName = fullName,
                    RoleId = role.Id,
                    MobileNumber = mobileNumber,
                    FatherName = fatherName,
                    MotherName = motherName,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    IsDeleted = false
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                // Create associated detail record
                // Always create UserDetails for all users
                var userDetails = new UserDetails { UserId = user.Id, CreatedDate = DateTime.UtcNow };
                _context.UserDetails.Add(userDetails);
                await _context.SaveChangesAsync();
                log.Status = "Success";
                log.ErrorMessage = "User created successfully";
                return log;
            }
            catch (Exception ex)
            {
                log.Status = "Failed";
                log.ErrorMessage = $"Error: {ex.Message}";
                return log;
            }
        }
        // BULK IMPORT: CSP DETAILS
        [HttpPost("csp-details")]
    [HttpPost("user-details")]
    public async Task<ActionResult<BulkImportResultDto>> ImportUserDetails(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            if (!file.FileName.EndsWith(".csv"))
                return BadRequest("Only CSV files are allowed");

            var result = new BulkImportResultDto();
            var logs = new List<ImportLogDto>();

            try
            {
                using var reader = new StreamReader(file.OpenReadStream());
                var csvContent = await reader.ReadToEndAsync();
                var lines = csvContent.Split('\n', StringSplitOptions.RemoveEmptyEntries);

                if (lines.Length < 2)
                {
                    return BadRequest("CSV file must contain header and at least one data row");
                }

                for (int i = 1; i < lines.Length; i++)
                {
                    var line = lines[i].Trim();
                    if (string.IsNullOrEmpty(line)) continue;
                    var log = await ProcessUserDetailRow(line, i + 1);
                    logs.Add(log);
                    result.TotalRecords++;
                    if (log.Status == "Success")
                        result.SuccessCount++;
                    else
                        result.FailureCount++;
                }
                result.Logs = logs;
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error processing file: {ex.Message}");
            }
        }

        [HttpGet("sample-csp-details-csv")]
    [HttpGet("sample-user-details-csv")]
    public IActionResult DownloadSampleUserDetailsCsv()
        {
            var csv = new StringBuilder();
            csv.AppendLine("Username,CSPCode,CSPName,BranchCode,ExpiryDate,BankName,BankAccount,IFSC,CertificateStatus,StatusId,CountryId,StateId,CityId,LocationId,Category,PAN,VoterId,AadharNo,Education");
            csv.AppendLine("john_doe,CSP001,John CSP,BR001,2025-12-31,ABC Bank,123456,IFSC001,Active,1,1,1,1,1,General,ABCDE1234F,VOTER123,123412341234,Graduate");
            var bytes = Encoding.UTF8.GetBytes(csv.ToString());
            return File(bytes, "text/csv", "csp_details_import_sample.csv");
        }

    private async Task<ImportLogDto> ProcessUserDetailRow(string csvRow, int rowNumber)
        {
            var log = new ImportLogDto { RowNumber = rowNumber };
            try
            {
                var fields = csvRow.Split(',');
                if (fields.Length < 19)
                {
                    log.Status = "Failed";
                    log.ErrorMessage = "Insufficient columns in CSV row";
                    return log;
                }
                if (!int.TryParse(fields[0].Trim(), out int userId))
                {
                    log.Status = "Failed";
                    log.ErrorMessage = "UserId must be a valid integer";
                    return log;
                }
                var code = fields[1].Trim();
                if (userId <= 0 || string.IsNullOrEmpty(code))
                {
                    log.Status = "Failed";
                    log.ErrorMessage = "UserId and Code are required";
                    return log;
                }
                // Check user exists
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);
                if (user == null)
                {
                    log.Status = "Failed";
                    log.ErrorMessage = $"UserId '{userId}' not found";
                    return log;
                }
                // Check Code uniqueness (not deleted)
                var existingDetail = await _context.UserDetails.FirstOrDefaultAsync(c => c.Code == code && !c.IsDeleted);
                if (existingDetail != null)
                {
                    log.Status = "Failed";
                    log.ErrorMessage = $"Code '{code}' already exists";
                    return log;
                }
                // Create UserDetails
                var userDetails = new UserDetails
                {
                    UserId = userId,
                    Code = code,
                    Name = fields[2].Trim(),
                    BranchCode = fields[3].Trim(),
                    ExpiryDate = DateTime.TryParse(fields[4].Trim(), out var exp) ? exp : (DateTime?)null,
                    BankName = fields[5].Trim(),
                    BankAccount = fields[6].Trim(),
                    IFSC = fields[7].Trim(),
                    CertificateStatus = fields[8].Trim(),
                    StatusId = int.TryParse(fields[9].Trim(), out var statusId) ? statusId : (int?)null,
                    CountryId = int.TryParse(fields[10].Trim(), out var countryId) ? countryId : (int?)null,
                    StateId = int.TryParse(fields[11].Trim(), out var stateId) ? stateId : (int?)null,
                    CityId = int.TryParse(fields[12].Trim(), out var cityId) ? cityId : (int?)null,
                    LocationId = int.TryParse(fields[13].Trim(), out var locId) ? locId : (int?)null,
                    Category = fields[14].Trim(),
                    PAN = fields[15].Trim(),
                    VoterId = fields[16].Trim(),
                    AadharNo = fields[17].Trim(),
                    Education = fields[18].Trim(),
                    CreatedDate = DateTime.UtcNow,
                    IsDeleted = false
                };
                _context.UserDetails.Add(userDetails);
                await _context.SaveChangesAsync();
                log.Status = "Success";
                log.ErrorMessage = "User Details created successfully";
                return log;
            }
            catch (Exception ex)
            {
                log.Status = "Failed";
                log.ErrorMessage = $"Error: {ex.Message}";
                return log;
            }
        }

        // BULK IMPORT: CSP DOCUMENTS
        [HttpPost("csp-documents")]
    [HttpPost("user-documents")]
    public async Task<ActionResult<BulkImportResultDto>> ImportUserDocuments(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            if (!file.FileName.EndsWith(".csv"))
                return BadRequest("Only CSV files are allowed");

            var result = new BulkImportResultDto();
            var logs = new List<ImportLogDto>();

            try
            {
                using var reader = new StreamReader(file.OpenReadStream());
                var csvContent = await reader.ReadToEndAsync();
                var lines = csvContent.Split('\n', StringSplitOptions.RemoveEmptyEntries);

                if (lines.Length < 2)
                {
                    return BadRequest("CSV file must contain header and at least one data row");
                }

                for (int i = 1; i < lines.Length; i++)
                {
                    var line = lines[i].Trim();
                    if (string.IsNullOrEmpty(line)) continue;
                    var log = await ProcessUserDocumentRow(line, i + 1);
                    logs.Add(log);
                    result.TotalRecords++;
                    if (log.Status == "Success")
                        result.SuccessCount++;
                    else
                        result.FailureCount++;
                }
                result.Logs = logs;
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error processing file: {ex.Message}");
            }
        }

        [HttpGet("sample-csp-documents-csv")]
    [HttpGet("sample-user-documents-csv")]
    public IActionResult DownloadSampleUserDocumentsCsv()
        {
            var csv = new StringBuilder();
            csv.AppendLine("CSPCode,DocumentType,DocumentPath,UploadedDate,Description");
            csv.AppendLine("CSP001,PAN,/docs/pan_csp001.pdf,2025-09-14,PAN Card for CSP001");
            var bytes = Encoding.UTF8.GetBytes(csv.ToString());
            return File(bytes, "text/csv", "csp_documents_import_sample.csv");
        }

    private async Task<ImportLogDto> ProcessUserDocumentRow(string csvRow, int rowNumber)
        {
            var log = new ImportLogDto { RowNumber = rowNumber };
            try
            {
                var fields = csvRow.Split(',');
                if (fields.Length < 5)
                {
                    log.Status = "Failed";
                    log.ErrorMessage = "Insufficient columns in CSV row";
                    return log;
                }
                var code = fields[0].Trim();
                var documentType = fields[1].Trim();
                var documentPath = fields[2].Trim();
                var uploadedDateStr = fields[3].Trim();
                var description = fields[4].Trim();
                if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(documentType) || string.IsNullOrEmpty(documentPath))
                {
                    log.Status = "Failed";
                    log.ErrorMessage = "Code, DocumentType, and DocumentPath are required";
                    return log;
                }
                // Check UserDetails exists
                var userDetails = await _context.UserDetails.FirstOrDefaultAsync(c => c.Code == code && !c.IsDeleted);
                if (userDetails == null)
                {
                    log.Status = "Failed";
                    log.ErrorMessage = $"Code '{code}' not found";
                    return log;
                }
                // Parse uploaded date
                DateTime uploadedDate = DateTime.UtcNow;
                if (!string.IsNullOrEmpty(uploadedDateStr))
                {
                    DateTime.TryParse(uploadedDateStr, out uploadedDate);
                }
                // Create UserDocument
                var userDocument = new UserDocuments
                {
                    Code = code,
                    DocumentType = documentType,
                    DocumentPath = documentPath,
                    UploadedDate = uploadedDate,
                    Description = description,
                    CreatedDate = DateTime.UtcNow,
                    IsDeleted = false
                };
                _context.UserDocuments.Add(userDocument);
                await _context.SaveChangesAsync();
                log.Status = "Success";
                log.ErrorMessage = "User Document created successfully";
                return log;
            }
            catch (Exception ex)
            {
                log.Status = "Failed";
                log.ErrorMessage = $"Error: {ex.Message}";
                return log;
            }
        }
    }
}