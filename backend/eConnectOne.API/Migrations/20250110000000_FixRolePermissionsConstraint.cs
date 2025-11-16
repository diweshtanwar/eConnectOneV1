using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace eConnectOne.API.Migrations
{
    public partial class FixRolePermissionsConstraint : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // First, reset the sequence to the correct value
            migrationBuilder.Sql(@"
                SELECT setval(
                    pg_get_serial_sequence('""RolePermissions""', 'Id'), 
                    COALESCE((SELECT MAX(""Id"") + 1 FROM ""RolePermissions""), 1), 
                    false
                );
            ");
            
            // Add unique constraint on RoleId and Permission combination (excluding soft-deleted)
            migrationBuilder.Sql(@"
                CREATE UNIQUE INDEX IF NOT EXISTS ""IX_RolePermissions_RoleId_Permission_Active""
                ON ""RolePermissions"" (""RoleId"", ""Permission"") 
                WHERE ""IsDeleted"" = false;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DROP INDEX IF EXISTS IX_RolePermissions_RoleId_Permission;
            ");
        }
    }
}
