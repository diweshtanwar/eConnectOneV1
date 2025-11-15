using Microsoft.EntityFrameworkCore;
using eConnectOne.API.Models;
using System;

namespace eConnectOne.API.Data
{
    public partial class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Existing DbSets
        public DbSet<User> Users { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        // New DbSets for Master Tables
        public DbSet<Role> Roles { get; set; }
        public DbSet<Country> Countries { get; set; }
        public DbSet<State> States { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Status> Statuses { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Designation> Designations { get; set; }

        // New DbSets for Ticket Management
        public DbSet<TicketStatus> TicketStatuses { get; set; }
        public DbSet<TicketType> TicketTypes { get; set; }
        public DbSet<ProblemType> ProblemTypes { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<TechnicalDetail> TechnicalDetails { get; set; }
        public DbSet<WithdrawalDetail> WithdrawalDetails { get; set; }
        public DbSet<DepositDetail> DepositDetails { get; set; }
        public DbSet<Attachment> Attachments { get; set; }
        public DbSet<TicketHistory> TicketHistory { get; set; }


      // New DbSets for Detail Tables
      public DbSet<GeneralUserDetails> GeneralUserDetails { get; set; }
      public DbSet<UserDetails> UserDetails { get; set; }
      public DbSet<UserDocuments> UserDocuments { get; set; }
      public DbSet<RolePermission> RolePermissions { get; set; }
        
        // New DbSets for Messaging System
        public DbSet<Message> Messages { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<GroupChat> GroupChats { get; set; }
        public DbSet<GroupChatMember> GroupChatMembers { get; set; }
        
        // New DbSets for Broadcast System
        public DbSet<Broadcast> Broadcasts { get; set; }
        public DbSet<BroadcastReceipt> BroadcastReceipts { get; set; }
        
        // New DbSets for Resource Center
        public DbSet<ResourceCategory> ResourceCategories { get; set; }
        public DbSet<Resource> Resources { get; set; }
        public DbSet<ResourceAccess> ResourceAccesses { get; set; }
        
        // New DbSets for Wallet System
        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<WalletTransaction> WalletTransactions { get; set; }
        
        // New DbSets for Risk Management
        public DbSet<UserLimit> UserLimits { get; set; }
        public DbSet<TransactionAudit> TransactionAudits { get; set; }
        
        // New DbSets for Commission Management
      public DbSet<Commission> Commissions { get; set; }
      public DbSet<CommissionBreakdown> CommissionBreakdowns { get; set; }
      public DbSet<CommissionDocuments> CommissionDocuments { get; set; }
        
        // New DbSets for Enhanced Logging
        public DbSet<SecurityLog> SecurityLogs { get; set; }


            protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
                  // CommissionDocuments configuration
                  modelBuilder.Entity<CommissionDocuments>(entity =>
                  {
                        entity.HasKey(e => e.Id);
                        entity.Property(e => e.CSPCode).IsRequired().HasMaxLength(50);
                        entity.Property(e => e.DocumentType).IsRequired().HasMaxLength(50);
                        entity.Property(e => e.DocumentPath).IsRequired().HasMaxLength(500);
                        entity.Property(e => e.CreatedDate).IsRequired();
                        entity.Property(e => e.IsDeleted).IsRequired();
                        entity.HasIndex(e => e.CSPCode);
                        entity.HasOne(e => e.User)
                                .WithMany()
                                .HasForeignKey(e => e.UserId)
                                .OnDelete(DeleteBehavior.Restrict);
                  });

                  // Configure global query filters
                  modelBuilder.Entity<Ticket>().HasQueryFilter(t => !t.IsDeleted);
                  modelBuilder.Entity<Attachment>().HasQueryFilter(a => !a.Ticket.IsDeleted);
                  modelBuilder.Entity<DepositDetail>().HasQueryFilter(d => !d.Ticket.IsDeleted);
                  modelBuilder.Entity<TechnicalDetail>().HasQueryFilter(t => !t.Ticket.IsDeleted);
                  modelBuilder.Entity<TicketHistory>().HasQueryFilter(h => !h.Ticket.IsDeleted);
                  modelBuilder.Entity<WithdrawalDetail>().HasQueryFilter(w => !w.Ticket.IsDeleted);

                  // Configure User entity
                  modelBuilder.Entity<User>(entity =>
                  {
                        entity.HasKey(e => e.Id);
                        entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
                        entity.Property(e => e.PasswordHash).IsRequired();
                        entity.Property(e => e.Email).HasMaxLength(255);
                        entity.Property(e => e.FullName).HasMaxLength(255);
                        entity.Property(e => e.MobileNumber).HasMaxLength(20);
                        entity.Property(e => e.EmergencyContactNumber).HasMaxLength(20);
                        entity.Property(e => e.FatherName).HasMaxLength(255);
                        entity.Property(e => e.MotherName).HasMaxLength(255);
                        entity.Property(e => e.IsDeleted).IsRequired(); // Ensure IsDeleted is required
                        entity.HasOne(e => e.Role) // Configure relationship to Role
                                .WithMany()
                                .HasForeignKey(e => e.RoleId)
                                .OnDelete(DeleteBehavior.Restrict); // Or .NoAction, depending on desired behavior
                  });

                  // Configure AuditLog entity (existing)
                  modelBuilder.Entity<AuditLog>(entity =>
                  {
                        entity.HasKey(e => e.Id);
                        entity.Property(e => e.Action).IsRequired().HasMaxLength(50);
                        entity.Property(e => e.EntityType).IsRequired().HasMaxLength(100);
                        entity.Property(e => e.EntityId).IsRequired().HasMaxLength(50);
                entity.Property(e => e.IpAddress).HasMaxLength(50);
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Master Tables
            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.Name).IsUnique(); // Ensure role names are unique
                entity.Property(e => e.IsDeleted).IsRequired();
            });

            modelBuilder.Entity<Country>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<State>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.Property(e => e.IsDeleted).IsRequired();
                entity.HasOne(e => e.Country)
                      .WithMany()
                      .HasForeignKey(e => e.CountryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<City>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.Property(e => e.IsDeleted).IsRequired();
                entity.HasOne(e => e.State)
                      .WithMany()
                      .HasForeignKey(e => e.StateId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Location>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.Property(e => e.IsDeleted).IsRequired();
                entity.HasOne(e => e.City)
                      .WithMany()
                      .HasForeignKey(e => e.CityId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Status>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.Name).IsUnique();
                entity.Property(e => e.IsDeleted).IsRequired();
            });

            modelBuilder.Entity<Department>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.HasIndex(e => e.Name).IsUnique();
                entity.Property(e => e.IsDeleted).IsRequired();
            });

            modelBuilder.Entity<Designation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.Property(e => e.IsDeleted).IsRequired();
                entity.HasOne(e => e.Department)
                      .WithMany()
                      .HasForeignKey(e => e.DepartmentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Detail Tables
            modelBuilder.Entity<GeneralUserDetails>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId).IsUnique(); // One-to-one relationship by UserId
                entity.Property(e => e.Address).HasMaxLength(500);
                entity.Property(e => e.Qualification).HasMaxLength(255);
                entity.Property(e => e.ProfilePicSource).HasMaxLength(500);
                entity.Property(e => e.CreatedDate).IsRequired();
                entity.Property(e => e.IsDeleted).IsRequired();
                entity.HasOne(e => e.User)
                      .WithOne()
                      .HasForeignKey<GeneralUserDetails>(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.City)
                      .WithMany()
                      .HasForeignKey(e => e.CityId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.State)
                      .WithMany()
                      .HasForeignKey(e => e.StateId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Department)
                      .WithMany()
                      .HasForeignKey(e => e.DepartmentId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Designation)
                      .WithMany()
                      .HasForeignKey(e => e.DesignationId)
                      .OnDelete(DeleteBehavior.Restrict);
            });


            // Add UserDetails configuration
            modelBuilder.Entity<UserDetails>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.UserId).IsUnique();
                entity.Property(e => e.Name).HasMaxLength(255);
                entity.Property(e => e.Code).HasMaxLength(50);
                entity.Property(e => e.BranchCode).HasMaxLength(50);
                entity.Property(e => e.BankName).HasMaxLength(255);
                entity.Property(e => e.BankAccount).HasMaxLength(50);
                entity.Property(e => e.IFSC).HasMaxLength(20);
                entity.Property(e => e.CertificateStatus).HasMaxLength(50);
                entity.Property(e => e.Category).HasMaxLength(100);
                entity.Property(e => e.PAN).HasMaxLength(20);
                entity.Property(e => e.VoterId).HasMaxLength(20);
                entity.Property(e => e.AadharNo).HasMaxLength(20);
                entity.Property(e => e.Education).HasMaxLength(255);
                entity.Property(e => e.CreatedDate).IsRequired();
                entity.Property(e => e.IsDeleted).IsRequired();
                entity.HasOne(e => e.User)
                      .WithOne()
                      .HasForeignKey<UserDetails>(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Status)
                      .WithMany()
                      .HasForeignKey(e => e.StatusId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Country)
                      .WithMany()
                      .HasForeignKey(e => e.CountryId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.State)
                      .WithMany()
                      .HasForeignKey(e => e.StateId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.City)
                      .WithMany()
                      .HasForeignKey(e => e.CityId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Location)
                      .WithMany()
                      .HasForeignKey(e => e.LocationId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Add UserDocuments configuration
            modelBuilder.Entity<UserDocuments>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.DocumentType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.DocumentPath).IsRequired().HasMaxLength(500);
                entity.Property(e => e.UploadedDate).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(255);
                entity.Property(e => e.IsDeleted).IsRequired();
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.UserDetails)
                      .WithMany()
                      .HasForeignKey(e => e.Code)
                      .HasPrincipalKey("Code")
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Ticket Management Entities
            modelBuilder.Entity<Ticket>(entity =>
            {
                entity.HasKey(e => e.TicketId);
                entity.Property(e => e.TicketId).ValueGeneratedOnAdd(); // Ensure GUID is generated on add
                entity.Property(e => e.Summary).IsRequired().HasMaxLength(255);
                entity.Property(e => e.RequestedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.IsDeleted).IsRequired();

                entity.HasOne(e => e.TicketType)
                      .WithMany()
                      .HasForeignKey(e => e.TypeId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.TicketStatus)
                      .WithMany()
                      .HasForeignKey(e => e.StatusId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.RaisedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.RaisedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.CreatedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.CreatedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.UpdatedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.UpdatedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TechnicalDetail>(entity =>
            {
                entity.HasKey(e => e.TicketId);
                entity.HasOne(e => e.Ticket)
                      .WithOne(t => t.TechnicalDetail)
                      .HasForeignKey<TechnicalDetail>(e => e.TicketId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.ProblemType)
                      .WithMany()
                      .HasForeignKey(e => e.ProblemTypeId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.ResolutionProvidedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.ResolutionProvidedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<WithdrawalDetail>(entity =>
            {
                entity.HasKey(e => e.TicketId);
                entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.AuthorizedAmount).HasColumnType("decimal(18, 2)");
                entity.HasOne(e => e.Ticket)
                      .WithOne(t => t.WithdrawalDetail)
                      .HasForeignKey<WithdrawalDetail>(e => e.TicketId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<DepositDetail>(entity =>
            {
                entity.HasKey(e => e.TicketId);
                entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
                entity.HasOne(e => e.Ticket)
                      .WithOne(t => t.DepositDetail)
                      .HasForeignKey<DepositDetail>(e => e.TicketId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Attachment>(entity =>
            {
                entity.HasKey(e => e.AttachmentId);
                entity.Property(e => e.AttachmentId).ValueGeneratedOnAdd();
                entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.FilePath).IsRequired();
                entity.Property(e => e.UploadedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Ticket)
                      .WithMany(t => t.Attachments)
                      .HasForeignKey(e => e.TicketId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.UploadedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.UploadedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<TicketHistory>(entity =>
            {
                entity.HasKey(e => e.HistoryId);
                entity.Property(e => e.HistoryId).ValueGeneratedOnAdd();
                entity.Property(e => e.ChangeType).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ChangedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Ticket)
                      .WithMany(t => t.TicketHistory)
                      .HasForeignKey(e => e.TicketId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.ChangedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.ChangedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure RolePermission entity
            modelBuilder.Entity<RolePermission>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Permission).IsRequired().HasMaxLength(100);
                entity.Property(e => e.IsDeleted).IsRequired();
                entity.HasOne(e => e.Role)
                      .WithMany()
                      .HasForeignKey(e => e.RoleId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Seed Roles data
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Admin", IsDeleted = false },
                new Role { Id = 2, Name = "HO user", IsDeleted = false },
                new Role { Id = 3, Name = "Master Admin", IsDeleted = false },
                new Role { Id = 4, Name = "CSP", IsDeleted = false }
            );

            // Seed default permissions with static dates
            var seedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            modelBuilder.Entity<RolePermission>().HasData(
                // Master Admin - Full access
                new RolePermission { Id = 1, RoleId = 3, Permission = "Dashboard", CanView = true, CanCreate = true, CanEdit = true, CanDelete = true, CreatedDate = seedDate, IsDeleted = false },
                new RolePermission { Id = 2, RoleId = 3, Permission = "UserManagement", CanView = true, CanCreate = true, CanEdit = true, CanDelete = true, CreatedDate = seedDate, IsDeleted = false },
                new RolePermission { Id = 3, RoleId = 3, Permission = "TicketManagement", CanView = true, CanCreate = true, CanEdit = true, CanDelete = true, CreatedDate = seedDate, IsDeleted = false },
                new RolePermission { Id = 4, RoleId = 3, Permission = "AuditLogs", CanView = true, CanCreate = false, CanEdit = false, CanDelete = false, CreatedDate = seedDate, IsDeleted = false },
                new RolePermission { Id = 5, RoleId = 3, Permission = "SystemSettings", CanView = true, CanCreate = true, CanEdit = true, CanDelete = true, CreatedDate = seedDate, IsDeleted = false },
                
                // Admin - Limited access
                new RolePermission { Id = 6, RoleId = 1, Permission = "Dashboard", CanView = true, CanCreate = false, CanEdit = false, CanDelete = false, CreatedDate = seedDate, IsDeleted = false },
                new RolePermission { Id = 7, RoleId = 1, Permission = "UserManagement", CanView = true, CanCreate = true, CanEdit = true, CanDelete = false, CreatedDate = seedDate, IsDeleted = false },
                new RolePermission { Id = 8, RoleId = 1, Permission = "TicketManagement", CanView = true, CanCreate = true, CanEdit = true, CanDelete = false, CreatedDate = seedDate, IsDeleted = false },
                new RolePermission { Id = 9, RoleId = 1, Permission = "AuditLogs", CanView = true, CanCreate = false, CanEdit = false, CanDelete = false, CreatedDate = seedDate, IsDeleted = false },
                
                // HO User - Basic access
                new RolePermission { Id = 10, RoleId = 2, Permission = "Dashboard", CanView = true, CanCreate = false, CanEdit = false, CanDelete = false, CreatedDate = seedDate, IsDeleted = false },
                new RolePermission { Id = 11, RoleId = 2, Permission = "TicketManagement", CanView = true, CanCreate = true, CanEdit = false, CanDelete = false, CreatedDate = seedDate, IsDeleted = false },
                
                // CSP - Ticket only
                new RolePermission { Id = 12, RoleId = 4, Permission = "Dashboard", CanView = true, CanCreate = false, CanEdit = false, CanDelete = false, CreatedDate = seedDate, IsDeleted = false },
                new RolePermission { Id = 13, RoleId = 4, Permission = "TicketManagement", CanView = true, CanCreate = true, CanEdit = false, CanDelete = false, CreatedDate = seedDate, IsDeleted = false }
            );

            // Configure Messaging System Entities
            modelBuilder.Entity<Message>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Subject).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Body).IsRequired();
                entity.Property(e => e.Priority).HasMaxLength(20);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.IsDeleted).IsRequired();
                
                entity.HasOne(e => e.FromUser)
                      .WithMany()
                      .HasForeignKey(e => e.FromUserId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasOne(e => e.ToUser)
                      .WithMany()
                      .HasForeignKey(e => e.ToUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            
            modelBuilder.Entity<ChatMessage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ConversationId).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Message).IsRequired();
                entity.Property(e => e.MessageType).HasMaxLength(20);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.IsDeleted).IsRequired();
                
                entity.HasOne(e => e.FromUser)
                      .WithMany()
                      .HasForeignKey(e => e.FromUserId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasOne(e => e.ToUser)
                      .WithMany()
                      .HasForeignKey(e => e.ToUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            
            modelBuilder.Entity<GroupChat>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.GroupId).IsRequired().HasMaxLength(100);
                entity.Property(e => e.GroupName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.GroupDescription).HasMaxLength(500);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.IsActive).IsRequired();
                
                entity.HasOne(e => e.CreatedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.CreatedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            
            modelBuilder.Entity<GroupChatMember>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.GroupId).IsRequired().HasMaxLength(100);
                entity.Property(e => e.JoinedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.IsAdmin).IsRequired();
                entity.Property(e => e.IsActive).IsRequired();
                
                entity.HasOne(e => e.Group)
                      .WithMany(g => g.Members)
                      .HasForeignKey(e => e.GroupId)
                      .HasPrincipalKey(g => g.GroupId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            
            // Configure Broadcast System Entities
            modelBuilder.Entity<Broadcast>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Message).IsRequired();
                entity.Property(e => e.Priority).HasMaxLength(20);
                entity.Property(e => e.TargetRoles).HasMaxLength(255);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.IsActive).IsRequired();
                
                entity.HasOne(e => e.SentByUser)
                      .WithMany()
                      .HasForeignKey(e => e.SentByUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            
            modelBuilder.Entity<BroadcastReceipt>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.IsRead).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                entity.HasOne(e => e.Broadcast)
                      .WithMany(b => b.Receipts)
                      .HasForeignKey(e => e.BroadcastId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            
            // Configure Resource Center Entities
            modelBuilder.Entity<ResourceCategory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Icon).HasMaxLength(50);
                entity.Property(e => e.Color).HasMaxLength(20);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.IsActive).IsRequired();
            });
            
            modelBuilder.Entity<Resource>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.ResourceType).HasMaxLength(20);
                entity.Property(e => e.ExternalUrl).HasMaxLength(1000);
                entity.Property(e => e.FileName).HasMaxLength(255);
                entity.Property(e => e.FilePath).HasMaxLength(500);
                entity.Property(e => e.MimeType).HasMaxLength(100);
                entity.Property(e => e.TargetRoles).HasMaxLength(255);
                entity.Property(e => e.Priority).HasMaxLength(20);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.IsActive).IsRequired();
                entity.Property(e => e.IsFeatured).IsRequired();
                
                entity.HasOne(e => e.Category)
                      .WithMany(c => c.Resources)
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasOne(e => e.UploadedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.UploadedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            
            modelBuilder.Entity<ResourceAccess>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.AccessType).HasMaxLength(20);
                entity.Property(e => e.AccessedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UserAgent).HasMaxLength(500);
                entity.Property(e => e.IpAddress).HasMaxLength(50);
                
                entity.HasOne(e => e.Resource)
                      .WithMany()
                      .HasForeignKey(e => e.ResourceId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            
            // Configure Wallet System Entities
            modelBuilder.Entity<Wallet>(entity =>
            {
                entity.HasKey(e => e.WalletId);
                entity.Property(e => e.WalletId).ValueGeneratedOnAdd();
                entity.Property(e => e.Balance).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.PendingAmount).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.IsActive).IsRequired();
                
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            
            modelBuilder.Entity<WalletTransaction>(entity =>
            {
                entity.HasKey(e => e.TransactionId);
                entity.Property(e => e.TransactionId).ValueGeneratedOnAdd();
                entity.Property(e => e.TransactionType).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.BalanceAfter).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Status).HasMaxLength(20);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                entity.HasOne(e => e.Wallet)
                      .WithMany(w => w.Transactions)
                      .HasForeignKey(e => e.WalletId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(e => e.Ticket)
                      .WithMany()
                      .HasForeignKey(e => e.TicketId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasOne(e => e.CreatedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.CreatedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            
            // Configure Risk Management Entities
            modelBuilder.Entity<UserLimit>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.DailyWithdrawalLimit).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.MonthlyWithdrawalLimit).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.SingleTransactionLimit).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.MinimumBalance).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.ApprovalThreshold).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            
            modelBuilder.Entity<TransactionAudit>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.Action).IsRequired().HasMaxLength(50);
                entity.Property(e => e.OldAmount).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.NewAmount).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.BalanceBefore).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.BalanceAfter).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.IpAddress).HasMaxLength(100);
                entity.Property(e => e.UserAgent).HasMaxLength(500);
                entity.Property(e => e.Reason).HasMaxLength(1000);
                entity.Property(e => e.RiskLevel).HasMaxLength(20);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                entity.HasOne(e => e.Ticket)
                      .WithMany()
                      .HasForeignKey(e => e.TicketId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasOne(e => e.WalletTransaction)
                      .WithMany()
                      .HasForeignKey(e => e.WalletTransactionId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasOne(e => e.PerformedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.PerformedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            
            // Configure Commission Management Entities
            modelBuilder.Entity<Commission>(entity =>
            {
                entity.HasKey(e => e.CommissionId);
                entity.Property(e => e.CommissionId).ValueGeneratedOnAdd();
                entity.Property(e => e.BaseCommission).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.BonusCommission).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.Deductions).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.TotalCommission).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.TaxDeducted).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.NetPayable).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.Status).HasMaxLength(20);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.Remarks).HasMaxLength(500);
                entity.Property(e => e.PaymentReference).HasMaxLength(100);
                entity.Property(e => e.CreatedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                entity.HasOne(e => e.CSPUser)
                      .WithMany()
                      .HasForeignKey(e => e.CSPUserId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasOne(e => e.CreatedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.CreatedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasOne(e => e.ApprovedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.ApprovedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                // Unique constraint for CSP + Month + Year
                entity.HasIndex(e => new { e.CSPUserId, e.Month, e.Year })
                      .IsUnique()
                      .HasDatabaseName("IX_Commission_CSP_Month_Year");
            });
            
            modelBuilder.Entity<CommissionBreakdown>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.ServiceType).IsRequired().HasMaxLength(100);
                entity.Property(e => e.TransactionVolume).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.CommissionRate).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.CommissionAmount).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.Notes).HasMaxLength(500);
                
                entity.HasOne(e => e.Commission)
                      .WithMany(c => c.CommissionBreakdowns)
                      .HasForeignKey(e => e.CommissionId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            
            modelBuilder.Entity<CommissionDocument>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);
                entity.Property(e => e.FileType).HasMaxLength(100);
                entity.Property(e => e.DocumentType).HasMaxLength(20);
                entity.Property(e => e.UploadedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                entity.HasOne(e => e.Commission)
                      .WithMany(c => c.CommissionDocuments)
                      .HasForeignKey(e => e.CommissionId)
                      .OnDelete(DeleteBehavior.Cascade);
                      
                entity.HasOne(e => e.UploadedByUser)
                      .WithMany()
                      .HasForeignKey(e => e.UploadedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            
            // Configure SecurityLog entity
            modelBuilder.Entity<SecurityLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.EventType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.IpAddress).HasMaxLength(50);
                entity.Property(e => e.UserAgent).HasMaxLength(500);
                entity.Property(e => e.Timestamp).HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
            
            // Seed Resource Categories with static dates
            modelBuilder.Entity<ResourceCategory>().HasData(
                new ResourceCategory { Id = 1, Name = "Software & Tools", Description = "Applications and utilities", Icon = "Apps", Color = "primary", SortOrder = 1, IsActive = true, CreatedAt = seedDate },
                new ResourceCategory { Id = 2, Name = "Training Materials", Description = "Educational content and tutorials", Icon = "School", Color = "secondary", SortOrder = 2, IsActive = true, CreatedAt = seedDate },
                new ResourceCategory { Id = 3, Name = "Forms & Templates", Description = "Downloadable forms and templates", Icon = "Description", Color = "success", SortOrder = 3, IsActive = true, CreatedAt = seedDate },
                new ResourceCategory { Id = 4, Name = "CSP Resources", Description = "CSP-specific materials", Icon = "Person", Color = "warning", SortOrder = 4, IsActive = true, CreatedAt = seedDate },
                new ResourceCategory { Id = 5, Name = "Policies & Procedures", Description = "Company guidelines and procedures", Icon = "Gavel", Color = "info", SortOrder = 5, IsActive = true, CreatedAt = seedDate }
            );

            // Note: Admin user should be created through proper seeding service
            // with environment-specific password configuration
            
            OnModelCreatingPartial(modelBuilder);
        }
        
        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}