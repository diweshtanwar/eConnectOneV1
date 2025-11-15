using eConnectOne.API.DTOs;
using eConnectOne.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace eConnectOne.API.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	[Authorize]
	public class UserDocumentsController : ControllerBase
	{
		private readonly IUserDocumentService _userDocumentService;

		public UserDocumentsController(IUserDocumentService userDocumentService)
		{
			_userDocumentService = userDocumentService;
		}

		[HttpGet]
		public async Task<ActionResult<IEnumerable<UserDocumentDto>>> GetAllUserDocuments()
		{
			var documents = await _userDocumentService.GetAllUserDocumentsAsync();
			return Ok(documents);
		}

		[HttpGet("{id}")]
		public async Task<ActionResult<UserDocumentDto>> GetUserDocument(int id)
		{
			var document = await _userDocumentService.GetUserDocumentByIdAsync(id);
			if (document == null)
			{
				return NotFound();
			}
			return Ok(document);
		}

		[HttpPost]
		public async Task<ActionResult<UserDocumentDto>> CreateUserDocument(UserDocumentCreateDto documentDto)
		{
			try
			{
				var createdDocument = await _userDocumentService.CreateUserDocumentAsync(documentDto);
				return CreatedAtAction(nameof(GetUserDocument), new { id = createdDocument.Id }, createdDocument);
			}
			catch (Exception)
			{
				return StatusCode(500, "An error occurred while creating the user document.");
			}
		}

		[HttpPut("{id}")]
		public async Task<ActionResult<UserDocumentDto>> UpdateUserDocument(int id, UserDocumentUpdateDto documentDto)
		{
			try
			{
				var updatedDocument = await _userDocumentService.UpdateUserDocumentAsync(id, documentDto);
				return Ok(updatedDocument);
			}
			catch (KeyNotFoundException)
			{
				return NotFound();
			}
			catch (Exception)
			{
				return StatusCode(500, "An error occurred while updating the user document.");
			}
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteUserDocument(int id)
		{
			try
			{
				var result = await _userDocumentService.DeleteUserDocumentAsync(id);
				if (!result)
				{
					return NotFound();
				}
				return NoContent();
			}
			catch (Exception)
			{
				return StatusCode(500, "An error occurred while deleting the user document.");
			}
		}
	}
}
