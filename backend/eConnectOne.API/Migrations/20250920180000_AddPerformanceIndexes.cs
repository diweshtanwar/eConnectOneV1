using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace eConnectOne.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Priority 1 Indexes: Foreign Key Lookups (Critical for N+1 prevention)
            
            // Users table - Foreign key to Roles lookup
            migrationBuilder.CreateIndex(
                name: "idx_users_roleid",
                table: "Users",
                column: "RoleId");

            // Wallets table - Foreign key to Users lookup
            migrationBuilder.CreateIndex(
                name: "idx_wallets_userid",
                table: "Wallets",
                column: "UserId");

            // GeneralUserDetails table - Foreign key to Users lookup
            migrationBuilder.CreateIndex(
                name: "idx_generaluserdetails_userid",
                table: "GeneralUserDetails",
                column: "UserId");

            // Priority 2 Indexes: Query Filtering and Login Operations
            
            // UserDocuments table - Code lookups (CSP document retrieval)
            migrationBuilder.CreateIndex(
                name: "idx_userdocuments_code",
                table: "UserDocuments",
                column: "Code");

            // Tickets table - Status and soft-delete filter (common filter combination)
            migrationBuilder.CreateIndex(
                name: "idx_tickets_statusid_isdeleted",
                table: "Tickets",
                columns: new[] { "StatusId", "IsDeleted" });

            // Users table - Email and soft-delete filter (login queries)
            migrationBuilder.CreateIndex(
                name: "idx_users_email_isdeleted",
                table: "Users",
                columns: new[] { "Email", "IsDeleted" },
                unique: false);

            // Priority 3 Indexes: Business Logic Queries

            // Commissions table - Commission reporting by CSP user, year, month
            migrationBuilder.CreateIndex(
                name: "idx_commissions_cspuserid_year_month",
                table: "Commissions",
                columns: new[] { "CSPUserId", "Year", "Month" });

            // UserDetails table - Foreign key to Users lookup (CSP user details)
            migrationBuilder.CreateIndex(
                name: "idx_userdetails_userid",
                table: "UserDetails",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop all indexes in reverse order
            migrationBuilder.DropIndex(
                name: "idx_users_roleid",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "idx_wallets_userid",
                table: "Wallets");

            migrationBuilder.DropIndex(
                name: "idx_generaluserdetails_userid",
                table: "GeneralUserDetails");

            migrationBuilder.DropIndex(
                name: "idx_userdocuments_code",
                table: "UserDocuments");

            migrationBuilder.DropIndex(
                name: "idx_tickets_statusid_isdeleted",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "idx_users_email_isdeleted",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "idx_commissions_cspuserid_year_month",
                table: "Commissions");

            migrationBuilder.DropIndex(
                name: "idx_userdetails_userid",
                table: "UserDetails");
        }
    }
}
