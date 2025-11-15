using System.ComponentModel.DataAnnotations;

namespace eConnectOne.API.Models
{
    public class Country
    {
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string Name { get; set; }
    }
}
