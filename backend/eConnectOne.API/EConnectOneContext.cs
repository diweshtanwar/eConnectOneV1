using Microsoft.EntityFrameworkCore;

namespace eConnectOne.API;

public partial class EConnectOneContext : DbContext
{
    public EConnectOneContext()
    {
    }

    public EConnectOneContext(DbContextOptions<EConnectOneContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ProblemType> ProblemTypes { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // DbContext is configured via dependency injection.
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ProblemType>(entity =>
        {
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.ProblemTypeName).HasMaxLength(100);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
