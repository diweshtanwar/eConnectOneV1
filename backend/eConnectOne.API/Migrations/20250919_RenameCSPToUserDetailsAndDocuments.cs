using Microsoft.EntityFrameworkCore.Migrations;

public partial class RenameCSPToUserDetailsAndDocuments : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Rename tables
        migrationBuilder.RenameTable(name: "CSPDetails", newName: "UserDetails");
        migrationBuilder.RenameTable(name: "CSPDocuments", newName: "UserDocuments");

        // Rename columns
        migrationBuilder.RenameColumn(
            name: "CSPCode",
            table: "UserDetails",
            newName: "Code"
        );
        migrationBuilder.RenameColumn(
            name: "CSPCode",
            table: "UserDocuments",
            newName: "Code"
        );
        // If you have foreign keys/indexes referencing old names, update them here as well
        // Example:
        // migrationBuilder.RenameIndex(
        //     name: "IX_CSPDocuments_UserId",
        //     table: "UserDocuments",
        //     newName: "IX_UserDocuments_UserId"
        // );
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Revert table names
        migrationBuilder.RenameTable(name: "UserDetails", newName: "CSPDetails");
        migrationBuilder.RenameTable(name: "UserDocuments", newName: "CSPDocuments");

        // Revert column names
        migrationBuilder.RenameColumn(
            name: "Code",
            table: "CSPDetails",
            newName: "CSPCode"
        );
        migrationBuilder.RenameColumn(
            name: "Code",
            table: "CSPDocuments",
            newName: "CSPCode"
        );
        // Revert indexes if needed
        // migrationBuilder.RenameIndex(
        //     name: "IX_UserDocuments_UserId",
        //     table: "CSPDocuments",
        //     newName: "IX_CSPDocuments_UserId"
        // );
    }
}
