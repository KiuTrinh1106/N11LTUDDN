# Project Vault structure
$vaultRoot = 'D:\MIS3032\vault'

# Create the root folder and all required subfolders.
$directories = @(
    '',
    '01-sources',
    '02-requirements',
    '03-domain',
    '04-product',
    '05-design',
    '06-technical',
    '07-testing',
    '08-decisions',
    '09-meetings'
)

foreach ($directory in $directories) {
    $path = if ($directory) { Join-Path $vaultRoot $directory } else { $vaultRoot }
    New-Item -Path $path -ItemType Directory -Force | Out-Null
}

# Create the required empty Markdown files.
$files = @(
    '00-index.md',
    '03-domain\glossary.md',
    '03-domain\business-rules.md',
    '03-domain\workflows.md'
)

foreach ($file in $files) {
    New-Item -Path (Join-Path $vaultRoot $file) -ItemType File -Force | Out-Null
}

Write-Host "Project Vault structure is ready at $vaultRoot"
