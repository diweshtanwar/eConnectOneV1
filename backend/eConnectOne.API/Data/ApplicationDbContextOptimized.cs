using Microsoft.EntityFrameworkCore;
using eConnectOne.API.Models;

namespace eConnectOne.API.Data
{
    public partial class ApplicationDbContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // Performance optimizations
                optionsBuilder.EnableSensitiveDataLogging(false);
                optionsBuilder.EnableServiceProviderCaching();
                optionsBuilder.EnableDetailedErrors(false);
            }
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
        {
            // Performance indexes
            modelBuilder.Entity<Ticket>()
                .HasIndex(t => new { t.TypeId, t.StatusId })
                .HasDatabaseName("IX_Tickets_Type_Status");

            modelBuilder.Entity<Ticket>()
                .HasIndex(t => t.CreatedDate)
                .HasDatabaseName("IX_Tickets_CreatedDate");

            // Query filters for soft delete
            modelBuilder.Entity<Ticket>()
                .HasQueryFilter(t => !t.IsDeleted);
        }
    }
}