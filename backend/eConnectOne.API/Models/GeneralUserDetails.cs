using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace eConnectOne.API.Models
{
    public class GeneralUserDetails
    {
        public int Id { get; set; }


    // Remove Username, use UserId as FK
    [Required]
    public int UserId { get; set; }
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

        [StringLength(500)]
        public string? Address { get; set; }

        [StringLength(255)]
        public string? Qualification { get; set; }

        [StringLength(500)]
        public string? ProfilePicSource { get; set; }

        public int? CityId { get; set; }

        [ForeignKey("CityId")]
        public City? City { get; set; }

        public int? StateId { get; set; }

        [ForeignKey("StateId")]
        public State? State { get; set; }

        public int? DepartmentId { get; set; }

        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }

        public int? DesignationId { get; set; }

        [ForeignKey("DesignationId")]
        public Designation? Designation { get; set; }

        public DateTime CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? UpdatedBy { get; set; }

        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedDate { get; set; }
    }
}
