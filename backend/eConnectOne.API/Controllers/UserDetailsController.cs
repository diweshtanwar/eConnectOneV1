using eConnectOne.API.DTOs;
using eConnectOne.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eConnectOne.API.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	[Authorize]
	public class UserDetailsController : ControllerBase
	{
		private readonly IUserDetailService _userDetailService;

		public UserDetailsController(IUserDetailService userDetailService)
		{
			_userDetailService = userDetailService;
		}

		[HttpGet]
		public async Task<ActionResult<IEnumerable<UserDetailDto>>> GetAllUserDetails()
		{
			var details = await _userDetailService.GetAllUserDetailsAsync();
			return Ok(details);
		}

		[HttpGet("{id}")]
		public async Task<ActionResult<UserDetailDto>> GetUserDetail(int id)
		{
			var detail = await _userDetailService.GetUserDetailByIdAsync(id);
			if (detail == null)
			{
				return NotFound();
			}
			return Ok(detail);
		}

		[HttpPost]
		public async Task<ActionResult<UserDetailDto>> CreateUserDetail(UserDetailDto detailDto)
		{
			try
			{
				var createdDetail = await _userDetailService.CreateUserDetailAsync(detailDto);
				return CreatedAtAction(nameof(GetUserDetail), new { id = createdDetail.Id }, createdDetail);
			}
			catch (Exception)
			{
				return StatusCode(500, "An error occurred while creating the user detail.");
			}
		}

		[HttpPut("{id}")]
		public async Task<ActionResult<UserDetailDto>> UpdateUserDetail(int id, UserDetailDto detailDto)
		{
			try
			{
				var updatedDetail = await _userDetailService.UpdateUserDetailAsync(id, detailDto);
				return Ok(updatedDetail);
			}
			catch (KeyNotFoundException)
			{
				return NotFound();
			}
			catch (Exception)
			{
				return StatusCode(500, "An error occurred while updating the user detail.");
			}
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteUserDetail(int id)
		{
			try
			{
				var result = await _userDetailService.DeleteUserDetailAsync(id);
				if (!result)
				{
					return NotFound();
				}
				return NoContent();
			}
			catch (Exception)
			{
				return StatusCode(500, "An error occurred while deleting the user detail.");
			}
		}
	}
}
