using System.ComponentModel.DataAnnotations;

namespace eConnectOne.API.DTOs
{
    public class UserDetailCreateDto : UserDetailDto
    {
        // Username is now required in base DTO, so no need for UserId
    }
}
