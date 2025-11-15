using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace eConnectOne.API.Models
{
    public class ProblemType
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ProblemTypeId { get; set; }

        [Required]
        [StringLength(100)]
        public string ProblemTypeName { get; set; }

        [StringLength(255)]
        public string? Description { get; set; }
    }
}
