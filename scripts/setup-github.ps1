#!/usr/bin/env pwsh
# GitHub Push Setup Script for eConnectOne

Write-Host "========================================" -ForegroundColor Green
Write-Host "eConnectOne GitHub Setup Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Variables
$projectRoot = "e:\Projects\Source\eConnectOneV1"
$userName = ""
$userEmail = ""
$githubUsername = ""

# Collect user input
Write-Host "Please provide the following information:" -ForegroundColor Yellow
$userName = Read-Host "Enter your Git username (first and last name)"
$userEmail = Read-Host "Enter your Git email"
$githubUsername = Read-Host "Enter your GitHub username"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 1: Navigating to project directory" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
cd $projectRoot
Write-Host "✓ Navigated to: $projectRoot" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 2: Initializing Git Repository" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
git init
git config user.name $userName
git config user.email $userEmail
Write-Host "✓ Git initialized with user: $userName <$userEmail>" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 3: Adding .gitignore file" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$gitignoreContent = @"
# Backend (.NET)
bin/
obj/
*.user
*.suo
*.sln.docstates
.vs/
.vscode/
packages/
*.ncrunchproject
*.ncrunchsolution

# Frontend (Node)
node_modules/
dist/
build/
.env.local
.env.*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
*.log

# Environment
.env
appsettings.Development.json
"@

$gitignoreContent | Out-File -FilePath "$projectRoot\.gitignore" -Encoding UTF8
Write-Host "✓ .gitignore created" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 4: Adding all files to Git" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
git add .
Write-Host "✓ All files added to staging area" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 5: Creating initial commit" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
git commit -m "Initial commit: eConnectOne full-stack solution with React frontend and ASP.NET Core backend"
Write-Host "✓ Initial commit created" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 6: Setting up GitHub remote" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$repoUrl = "https://github.com/$githubUsername/eConnectOneV1.git"
git remote add origin $repoUrl
git branch -M main
Write-Host "✓ Remote added: $repoUrl" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "IMPORTANT: Before pushing, create the repository on GitHub!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Cyan
Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name: eConnectOneV1" -ForegroundColor White
Write-Host "3. Description: Full-stack business management solution" -ForegroundColor White
Write-Host "4. Choose Public or Private" -ForegroundColor White
Write-Host "5. DO NOT check any initialization options" -ForegroundColor White
Write-Host "6. Click 'Create repository'" -ForegroundColor White
Write-Host ""

$ready = Read-Host "Have you created the GitHub repository? (yes/no)"

if ($ready -eq "yes" -or $ready -eq "y") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Step 7: Pushing code to GitHub" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    git push -u origin main
    Write-Host "✓ Code pushed to GitHub successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ ALL STEPS COMPLETED!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your repository is now available at: $repoUrl" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Please create the repository on GitHub first, then run:" -ForegroundColor Yellow
    Write-Host "cd $projectRoot" -ForegroundColor White
    Write-Host "git push -u origin main" -ForegroundColor White
}
