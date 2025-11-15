using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace eConnectOne.API.Models
{
    public class UserDetails
    {
        public int Id { get; set; }



    // New: UserId FK to Users table
    public int UserId { get; set; }
    [ForeignKey("UserId")]
    public User? User { get; set; }

        [StringLength(255)]

    public string? Name { get; set; }

    [Required]
    [StringLength(50)]
    public string Code { get; set; } = null!;

        [StringLength(50)]
        public string? BranchCode { get; set; }

        public DateTime? ExpiryDate { get; set; }

        [StringLength(255)]
        public string? BankName { get; set; }

        [StringLength(50)]
        public string? BankAccount { get; set; }

        [StringLength(20)]
        public string? IFSC { get; set; }

        [StringLength(50)]
        public string? CertificateStatus { get; set; }

        public int? StatusId { get; set; }

        [ForeignKey("StatusId")]
        public Status? Status { get; set; }

        public int? CountryId { get; set; }

        [ForeignKey("CountryId")]
        public Country? Country { get; set; }

        public int? StateId { get; set; }

        [ForeignKey("StateId")]
        public State? State { get; set; }

        public int? CityId { get; set; }

        [ForeignKey("CityId")]
        public City? City { get; set; }

        public int? LocationId { get; set; }

        [ForeignKey("LocationId")]
        public Location? Location { get; set; }

        [StringLength(100)]
        public string? Category { get; set; }

        [StringLength(20)]
        public string? PAN { get; set; }

        [StringLength(20)]
        public string? VoterId { get; set; }

        [StringLength(20)]
        public string? AadharNo { get; set; }

        [StringLength(255)]
        public string? Education { get; set; }

        public DateTime CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? UpdatedBy { get; set; }

        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedDate { get; set; }
    }
}
