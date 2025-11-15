using System.ComponentModel.DataAnnotations;

namespace eConnectOne.API.DTOs
{
    public class GeneralUserDetailDto
    {
        public int? Id { get; set; } // Nullable for creation, required for update

        [StringLength(500)]
        public string? Address { get; set; }

        [StringLength(255)]
        public string? Qualification { get; set; }

        [StringLength(500)]
        public string? ProfilePicSource { get; set; }

        public int? CityId { get; set; }
        public int? StateId { get; set; }
        public int? DepartmentId { get; set; }
        public int? DesignationId { get; set; }
    }
}
