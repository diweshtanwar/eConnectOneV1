# Documentation Index

This repository's detailed documentation has been organized into the `docs/` folder.

Quick links:

- Configuration & Setup: CONFIGURATION_GUIDE.md
- CI/CD: CI_CD_SETUP.md
- Deploy guides: FREE_HOSTING_SETUP.md, RAILWAY_DEPLOYMENT.md, RAILWAY_QUICK_START.md
- Verification: VERIFY_API.md, API_TEST_RESULTS.md
- Developer notes: ALIGNMENT_VALIDATION.md, IMPLEMENTATION_SUMMARY.md

To automatically move files into this folder (safe dry-run first), run from the repository root:

```powershell
.\scripts\organize-files.ps1
```

To perform the actual moves:

```powershell
.\scripts\organize-files.ps1 -Execute
```

If you prefer I run the `-Execute` step now, tell me and I'll proceed.
