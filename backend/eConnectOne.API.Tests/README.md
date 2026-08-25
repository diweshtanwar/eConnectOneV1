# eConnectOne.API.Tests

Backend integration test suite for the eConnectOne API. **Not part of the deployment
pipeline or Docker image** — [`Dockerfile`](../../Dockerfile) only restores/builds/publishes
`eConnectOne.API.csproj` by explicit path, so this project never ships to production.
It exists purely so the team can run a fast, repeatable check that the backend actually
works correctly for **Master Admin**, **Admin**, **HO user**, and **CSP** roles before
(or after) shipping a change.

## What it does

Each test boots the *real* `eConnectOne.API` application (`Program.cs`, all controllers,
services, JWT authentication — everything) against an isolated in-memory database, using
[`Microsoft.AspNetCore.Mvc.Testing`](https://learn.microsoft.com/aspnet/core/test/integration-tests)'s
`WebApplicationFactory<Program>`. It seeds one test user per role and logs each one in
through the real `POST /api/auth/login` endpoint (exercising actual BCrypt password
verification and JWT issuance) — not a mocked auth bypass — then calls real controller
endpoints with the resulting bearer tokens.

## Why this project exists

A real production bug slipped through where `WalletController` and
`RiskManagementController` checked for role `"HO User"` (capital U) while the database
seeds the role as `"HO user"` (lowercase u). ASP.NET Core's role-claim comparison is
case-sensitive, so real "HO user" accounts were silently rejected with `403 Forbidden` on
endpoints they should have had access to — which is exactly the kind of thing that shows
up in the UI as a generic "Oops! Something went wrong" error, with no clear signal about
*which* role or *which* page is affected.

[`RoleAuthorizationMatrixTests.cs`](Tests/RoleAuthorizationMatrixTests.cs) locks in the
intended role → endpoint access matrix so this class of bug fails a test immediately,
with a message naming the exact role and endpoint, instead of only surfacing later as a
vague error screen for a real user.

## Running the tests

```powershell
cd backend/eConnectOne.API.Tests
dotnet test
```

Or from the repo root, to run just this project:

```powershell
dotnet test backend/eConnectOne.API.Tests/eConnectOne.API.Tests.csproj
```

No database, Docker, or running backend required — everything runs in-process against
an in-memory EF Core provider.

## Project layout

- **`Infrastructure/TestUsers.cs`** — the four well-known test accounts (one per role)
  and the shared password. Role names here must exactly match the seed data in
  `ApplicationDbContext`'s `Role.HasData` — that exact-match requirement is deliberate;
  see the note above.
- **`Infrastructure/CustomWebApplicationFactory.cs`** — boots the app with its
  Npgsql-backed `ApplicationDbContext` swapped for an isolated in-memory database.
- **`Infrastructure/ApiFixture.cs`** — shared xUnit collection fixture: boots one app
  instance, seeds the four role accounts, and logs each one in once (via the real login
  endpoint), caching an authenticated `HttpClient` per role for all tests to reuse.
- **`Tests/AuthTests.cs`** — login sanity checks (success per role, wrong password,
  unauthenticated access).
- **`Tests/RoleAuthorizationMatrixTests.cs`** — the main regression guard: for each
  `[Authorize(Roles = "...")]`-restricted endpoint, asserts allowed roles are NOT
  rejected with 403 and disallowed roles ARE rejected with 403.
- **`Tests/GeneralAuthenticatedAccessTests.cs`** — baseline smoke tests for endpoints
  every authenticated role should reach (dashboard stats, own wallet, roles list, own
  commissions) — the kind of pages a user lands on right after logging in.

## Extending this suite

To cover another controller or endpoint:

1. If it's role-restricted (`[Authorize(Roles = "...")]`), add cases to
   `RoleAuthorizationMatrixTests.cs` following the existing `AssertAllowed` /
   `AssertForbidden` pattern — one pair of test methods per endpoint is usually enough.
2. If it's open to any authenticated user (`[Authorize]` with no `Roles`), add a
   `[Theory]` + `[MemberData(nameof(GeneralAuthenticatedAccessTests.AllRoles))]` case to
   `GeneralAuthenticatedAccessTests.cs`.
3. For deeper functional tests (not just "is this endpoint reachable" but "does it
   return the right data"), add a new test class under `Tests/` — it can reuse
   `ApiFixture` the same way via `[Collection(ApiTestCollection.Name)]`.
