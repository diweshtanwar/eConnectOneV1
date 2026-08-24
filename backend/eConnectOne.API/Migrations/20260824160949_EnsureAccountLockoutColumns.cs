using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace eConnectOne.API.Migrations
{
    /// <inheritdoc />
    public partial class EnsureAccountLockoutColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Defensive/idempotent repair migration.
            //
            // The "AddAccountLockout" migration (20250907171425) was accidentally
            // committed as an empty no-op, and the later "InitialCleanMigration"
            // (20250916082204) re-creates all tables from scratch via CreateTable,
            // which fails with "relation already exists" on any database that was
            // already populated by the earlier incremental migrations. Because that
            // failure is caught and swallowed by the startup migration/seed logic in
            // Program.cs, some deployed databases never actually received the
            // account-lockout columns that AuthController relies on, causing
            // "column does not exist" errors (surfaced to clients as a generic 500)
            // on every login attempt.
            //
            // Use IF NOT EXISTS so this is safe to apply regardless of whether the
            // columns already exist (e.g. on databases where InitialCleanMigration
            // succeeded).
            migrationBuilder.Sql(
                "ALTER TABLE \"Users\" ADD COLUMN IF NOT EXISTS \"FailedLoginAttempts\" integer NOT NULL DEFAULT 0;");
            migrationBuilder.Sql(
                "ALTER TABLE \"Users\" ADD COLUMN IF NOT EXISTS \"IsLocked\" boolean NOT NULL DEFAULT FALSE;");
            migrationBuilder.Sql(
                "ALTER TABLE \"Users\" ADD COLUMN IF NOT EXISTS \"LockedUntil\" timestamp with time zone NULL;");
            migrationBuilder.Sql(
                "ALTER TABLE \"Users\" ADD COLUMN IF NOT EXISTS \"LastFailedLoginAt\" timestamp with time zone NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No-op: removing these columns could destroy account-lockout state and
            // isn't necessary to reverse a purely additive, defensive repair.
        }
    }
}
