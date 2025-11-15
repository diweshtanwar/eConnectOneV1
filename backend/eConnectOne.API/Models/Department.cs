using System.ComponentModel.DataAnnotations;

namespace eConnectOne.API.Models
{
    public class Department
    {
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string Name { get; set; }

        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedDate { get; set; }
    }
}
