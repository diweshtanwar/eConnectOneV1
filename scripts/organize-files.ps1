<#
.SYNOPSIS
  Organize top-level documentation and scripts into `docs/` and `scripts/` directories.

.DESCRIPTION
  Safely copies top-level Markdown files into `docs/` and PowerShell scripts into `scripts/`.
  By default this script runs in "dry-run" mode and shows actions it would take.
  Use `-Execute` to perform the moves. Originals are preserved in `docs/originals/` when moving markdown files.
#>

param(
    [switch]$Execute
)

function Ensure-Dir($path){ if (-not (Test-Path $path)) { New-Item -ItemType Directory -Path $path | Out-Null } }

$repoRoot = (Get-Location).Path
$docsDir = Join-Path $repoRoot 'docs'
$docsBackup = Join-Path $docsDir 'originals'
$scriptsDir = Join-Path $repoRoot 'scripts'

Ensure-Dir $docsDir
Ensure-Dir $docsBackup
Ensure-Dir $scriptsDir

#$mdFiles: all top-level .md except README.md and files already under docs
$mdFiles = Get-ChildItem -Path $repoRoot -Filter *.md -File | Where-Object { $_.Name -ne 'README.md' }

Write-Host "Found $($mdFiles.Count) markdown files to copy/move." -ForegroundColor Cyan
foreach ($f in $mdFiles) {
    $src = $f.FullName
    $dest = Join-Path $docsDir $f.Name
    $backup = Join-Path $docsBackup $f.Name
    if ($Execute) {
        Copy-Item -Path $src -Destination $backup -Force
        Move-Item -Path $src -Destination $dest -Force
        Write-Host "Moved: $($f.Name) -> docs/" -ForegroundColor Green
    }
    else {
        Write-Host "DRY-RUN: would copy and move $($f.Name) to docs/" -ForegroundColor Yellow
    }
}

# Move PowerShell scripts (except this file) into scripts/ directory
$ps1Files = Get-ChildItem -Path $repoRoot -Filter *.ps1 -File | Where-Object { $_.FullName -ne $MyInvocation.MyCommand.Definition }
foreach ($s in $ps1Files) {
    $src = $s.FullName
    $dest = Join-Path $scriptsDir $s.Name
    if ($Execute) {
        Move-Item -Path $src -Destination $dest -Force
        Write-Host "Moved script: $($s.Name) -> scripts/" -ForegroundColor Green
    }
    else {
        Write-Host "DRY-RUN: would move script $($s.Name) to scripts/" -ForegroundColor Yellow
    }
}

Write-Host "Done. Rerun with -Execute to apply changes." -ForegroundColor Cyan