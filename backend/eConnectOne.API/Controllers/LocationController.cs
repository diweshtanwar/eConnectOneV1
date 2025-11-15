using eConnectOne.API.Models;
using eConnectOne.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace eConnectOne.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LocationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public LocationController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("states")]
        public async Task<IActionResult> GetStates()
        {
            var states = await _context.States
                .Where(s => !s.IsDeleted)
                .Select(s => new { s.Id, s.Name, s.CountryId })
                .ToListAsync();
            return Ok(states);
        }

        [HttpGet("cities")]
        public async Task<IActionResult> GetCities()
        {
            var cities = await _context.Cities
                .Where(c => !c.IsDeleted)
                .Select(c => new { c.Id, c.Name, c.StateId })
                .ToListAsync();
            return Ok(cities);
        }
    }
}
