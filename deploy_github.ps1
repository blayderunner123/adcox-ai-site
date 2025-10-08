# === GitHub Deploy: include ALL modified files ===
$RepoPath = "C:\dev\adcox-ai-site"
$Branch   = "main"
$RepoUrl  = ""  # optional if origin already exists

Set-Location $RepoPath
Write-Host "➡ Deploying all modified files from $RepoPath..."

if (-not (Test-Path ".git")) {
  git init
  git checkout -b $Branch 2>$null
}

# Make sure we’re on main
try { git checkout $Branch } catch { git checkout -b $Branch }

# Add origin if missing
if (-not (git remote) -contains "origin") {
  if ($RepoUrl) { git remote add origin $RepoUrl }
  else { Write-Warning "No origin remote set. Add RepoUrl if new repo." }
}

# Sync from remote (safe to ignore if first deploy)
try { git pull --rebase origin $Branch } catch { Write-Host "No remote branch yet or nothing to rebase." }

# Stage *everything* (all edits, new, deletes)
git add -A

# Commit only if there are staged changes
if (git diff --cached --quiet) {
  Write-Host "✅ Nothing changed — up to date."
} else {
  $msg = "deploy: site updates + metrics page"
  git commit -m $msg
  git push -u origin $Branch
  Write-Host "✅ All changes pushed to GitHub."
}