using System;
using System.Collections.Generic;
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
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql("Server=localhost;Port=5432;Database=eConnectOne;User Id=postgres;Password=postgres@123;");

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
