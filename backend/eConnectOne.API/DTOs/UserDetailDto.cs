using System.ComponentModel.DataAnnotations;

namespace eConnectOne.API.DTOs
{
    public class UserDetailDto
    {
        public int? Id { get; set; }
        public int UserId { get; set; }

        [StringLength(255)]
        public string? Name { get; set; }

        [StringLength(50)]
        public string? Code { get; set; }

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
        public int? CountryId { get; set; }
        public int? StateId { get; set; }
        public int? CityId { get; set; }
        public int? LocationId { get; set; }

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
    }
}
