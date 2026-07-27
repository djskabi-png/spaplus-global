param(
    [string]$RepositoryPath = (Split-Path -Parent $PSScriptRoot),
    [string]$BackupRoot = (Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'SpaPlus Global Backups')
)

$ErrorActionPreference = 'Stop'

$repository = (Resolve-Path -LiteralPath $RepositoryPath).Path
$gitDirectory = Join-Path $repository '.git'
if (-not (Test-Path -LiteralPath $gitDirectory)) {
    throw "The SpaPlus Global repository was not found at $repository."
}

New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null

$dateStamp = Get-Date -Format 'yyyy-MM-dd'
$archivePath = Join-Path $BackupRoot "spaplus-global-source-$dateStamp.zip"
$historyPath = Join-Path $BackupRoot "spaplus-global-history-$dateStamp.bundle"
$manifestPath = Join-Path $BackupRoot "spaplus-global-backup-$dateStamp.txt"
$temporaryArchive = "$archivePath.partial"
$temporaryHistory = "$historyPath.partial"

Push-Location $repository
try {
    git archive --format=zip --output=$temporaryArchive HEAD
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to create the source archive.'
    }

    git bundle create $temporaryHistory --all
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to create the Git history bundle.'
    }

    git bundle verify $temporaryHistory | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw 'The Git history bundle failed verification.'
    }

    Move-Item -LiteralPath $temporaryArchive -Destination $archivePath -Force
    Move-Item -LiteralPath $temporaryHistory -Destination $historyPath -Force

    $commit = (git rev-parse HEAD).Trim()
    $archiveHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash
    $historyHash = (Get-FileHash -LiteralPath $historyPath -Algorithm SHA256).Hash
    @(
        "Created: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')"
        "Repository: $repository"
        "Commit: $commit"
        "Source archive: $archivePath"
        "Source SHA256: $archiveHash"
        "History bundle: $historyPath"
        "History SHA256: $historyHash"
        'Verification: Git bundle verified successfully'
    ) | Set-Content -LiteralPath $manifestPath -Encoding utf8
}
finally {
    Pop-Location
    Remove-Item -LiteralPath $temporaryArchive -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $temporaryHistory -Force -ErrorAction SilentlyContinue
}

[pscustomobject]@{
    created = $true
    source_archive = $archivePath
    history_bundle = $historyPath
    manifest = $manifestPath
} | ConvertTo-Json -Compress
