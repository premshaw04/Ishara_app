# This script packages your project for a hackathon submission, 
# excluding heavy directories that shouldn't be submitted.

$projectName = Split-Path -Path (Get-Location) -Leaf
$destination = "..\${projectName}_Submission.zip"

Write-Host "Zipping project to $destination..."

# Define folders/files to exclude
$exclude = @(
    'node_modules', 
    '.venv', 
    'venv', 
    '.git', 
    '__pycache__', 
    '.expo', 
    '.next',
    'dist',
    'build',
    '*.zip'
)

# Collect all files except the excluded ones
Get-ChildItem -Path . -Recurse -Exclude $exclude | 
    Where-Object { 
        $path = $_.FullName
        $keep = $true
        foreach ($ex in $exclude) {
            # Skip if the path contains the excluded directory name
            if ($path -match "\\$ex\\" -or $path -match "\\$ex$") {
                $keep = $false
                break
            }
        }
        $keep
    } | Compress-Archive -DestinationPath $destination -Force

Write-Host "Success! Your submission file is ready at: $destination"
