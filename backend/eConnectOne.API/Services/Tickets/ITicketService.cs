using eConnectOne.API.DTOs.Tickets;
using eConnectOne.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace eConnectOne.API.Services.Tickets
{
    public interface ITicketService
    {
        Task<IEnumerable<TicketDto>> GetAllTicketsAsync(int? userId = null, string? userRole = null);
        Task<IEnumerable<TicketDto>> GetTicketsByTypeAsync(int typeId, bool includeClosed = false);
        Task<TicketDto?> GetTicketByIdAsync(Guid ticketId);
        Task<TicketDto> CreateTicketAsync(TicketCreateDto ticketCreateDto, int createdByUserId);
        Task<TicketDto?> UpdateTicketAsync(Guid ticketId, TicketUpdateDto ticketUpdateDto, int updatedByUserId);
        Task<bool> DeleteTicketAsync(Guid ticketId, int deletedByUserId);
        Task<bool> UpdateTicketStatusAsync(Guid ticketId, int newStatusId, int updatedByUserId);
        Task<bool> AddCommentToTicketAsync(Guid ticketId, string comment, int commentedByUserId);
    }
}
