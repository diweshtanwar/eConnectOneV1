
using eConnectOne.API.DTOs;
using eConnectOne.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eConnectOne.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // All endpoints require authorization by default
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        // GET: api/Users (all users, optional roleId)
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers([FromQuery] int? roleId = null)
        {
            var users = await _userService.GetUsersByRoleAsync(roleId);
            return Ok(users);
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetAllUsers(
            [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var currentUserId = GetCurrentUserId();
            var currentUserRole = GetCurrentUserRole();
            var users = await _userService.GetAllUsersAsync(pageNumber, pageSize, currentUserId, currentUserRole);
            return Ok(users);
        }

        // GET: api/Users/full-details
        [HttpGet("full-details")]
        public async Task<ActionResult<IEnumerable<UserFullDetailsDto>>> GetAllUsersWithFullDetails()
        {
            var users = await _userService.GetAllUsersWithFullDetailsAsync();
            return Ok(users);
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDto>> GetUser(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        // POST: api/Users
        [HttpPost]
        [AllowAnonymous] // Allow creation of new users without authentication (e.g., for registration)
        public async Task<ActionResult<UserResponseDto>> CreateUser(UserCreateDto userDto)
        {
            try
            {
                var createdUser = await _userService.CreateUserAsync(userDto);
                return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, createdUser);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, "An error occurred while creating the user.");
            }
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<ActionResult<UserResponseDto>> UpdateUser(int id, UserUpdateDto userDto)
        {
            try
            {
                var updatedUser = await _userService.UpdateUserAsync(id, userDto);
                return Ok(updatedUser);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, "An error occurred while updating the user.");
            }
        }

        // PUT: api/Users/{userId}/general-details
        [HttpPut("{userId}/general-details")]
        public async Task<ActionResult<UserResponseDto>> UpdateGeneralUserDetails(int userId, GeneralUserDetailDto detailsDto)
        {
            try
            {
                var updatedUser = await _userService.UpdateGeneralUserDetailsAsync(userId, detailsDto);
                return Ok(updatedUser);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, "An error occurred while updating general user details.");
            }
        }

        // PUT: api/Users/{userId}/user-details
        [HttpPut("{userId}/user-details")]
        public async Task<ActionResult<UserResponseDto>> UpdateUserDetails(int userId, UserDetailDto detailsDto)
        {
            try
            {
                var updatedUser = await _userService.UpdateUserDetailsAsync(userId, detailsDto);
                return Ok(updatedUser);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, "An error occurred while updating CSP details.");
            }
        }

        // DELETE: api/Users/5 (Soft Delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> SoftDeleteUser(int id)
        {
            try
            {
                var result = await _userService.SoftDeleteUserAsync(id);
                if (!result)
                {
                    return NotFound();
                }
                return NoContent(); // 204 No Content
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, "An error occurred while soft deleting the user.");
            }
        }

        // POST: api/Users/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreUser(int id)
        {
            try
            {
                var result = await _userService.RestoreUserAsync(id);
                if (!result)
                {
                    return NotFound();
                }
                return Ok(); // 200 OK
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, "An error occurred while restoring the user.");
            }
        }

        // POST: api/Users/5/reset-password
        [HttpPost("{id}/reset-password")]
        [Authorize(Roles = "Master Admin")] // Only Master Admin can reset other users' passwords
        public async Task<IActionResult> ResetUserPassword(int id, PasswordResetDto passwordResetDto)
        {
            try
            {
                var result = await _userService.ResetPasswordAsync(id, passwordResetDto.NewPassword);
                if (!result)
                {
                    return NotFound("User not found.");
                }
                return Ok(new { message = "Password reset successfully." });
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, "An error occurred while resetting the password.");
            }
        }

        // POST: api/Users/reset-my-password
        [HttpPost("reset-my-password")]
        public async Task<IActionResult> ResetMyPassword(PasswordResetDto passwordResetDto)
        {
            try
            {
                // Get current user ID from JWT token
                var userIdClaim = User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized("Invalid user token.");
                }

                var result = await _userService.ResetPasswordAsync(userId, passwordResetDto.NewPassword);
                if (!result)
                {
                    return NotFound("User not found.");
                }
                return Ok(new { message = "Your password has been reset successfully." });
            }
            catch (Exception ex)
            {
                // Log the exception
                return StatusCode(500, "An error occurred while resetting your password.");
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("id")?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 1;
        }

        private string GetCurrentUserRole()
        {
            return User.FindFirst("role")?.Value ?? "HO user";
        }
    }
}