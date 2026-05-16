# Script to package the Lambda functions as ZIPs
# Usage: ./build.ps1

param(
    [string]$OutputDir = ".\dist"
)

$ErrorActionPreference = "Stop"

Write-Host "Starting Lambda build..." -ForegroundColor Cyan

if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

function Get-FileSizeText {
    param([string]$Path)
    $size = (Get-Item $Path).Length
    return "{0:N0} bytes" -f $size
}

function Build-Zip {
    param(
        [string]$SourceDir,
        [string]$ZipPath
    )

    if (Test-Path $ZipPath) {
        Remove-Item $ZipPath -Force
    }

    Compress-Archive -Path "$SourceDir\*" -DestinationPath $ZipPath
    Write-Host "Created $ZipPath ($(Get-FileSizeText $ZipPath))"
}

function Install-LambdaDependencies {
    param(
        [string]$RequirementsFile,
        [string]$TargetDir
    )

    pip install -q -r $RequirementsFile `
        -t $TargetDir `
        --no-cache-dir `
        --platform manylinux2014_x86_64 `
        --implementation cp `
        --python-version 3.13 `
        --abi cp313 `
        --only-binary=:all:
}

$mainLambdaDir = "main_handler_build"
if (Test-Path $mainLambdaDir) {
    Remove-Item -Recurse -Force $mainLambdaDir
}
New-Item -ItemType Directory -Path $mainLambdaDir | Out-Null

Copy-Item -Path "app" -Destination "$mainLambdaDir/app" -Recurse
Copy-Item -Path "handler.py" -Destination "$mainLambdaDir/"
Install-LambdaDependencies -RequirementsFile "requirements.txt" -TargetDir "$mainLambdaDir/"
Build-Zip -SourceDir $mainLambdaDir -ZipPath "$OutputDir/main_handler.zip"

$dailyLambdaDir = "daily_handler_build"
if (Test-Path $dailyLambdaDir) {
    Remove-Item -Recurse -Force $dailyLambdaDir
}
New-Item -ItemType Directory -Path $dailyLambdaDir | Out-Null

Copy-Item -Path "functions/daily_notifications.py" -Destination "$dailyLambdaDir/"

$dailyRequirements = @"
boto3>=1.26.0,<2.0
psycopg2-binary>=2.9.0,<3.0
python-dotenv>=0.21.0
"@

$dailyRequirements | Out-File -FilePath "$dailyLambdaDir/requirements.txt"
Install-LambdaDependencies -RequirementsFile "$dailyLambdaDir/requirements.txt" -TargetDir "$dailyLambdaDir/"
Build-Zip -SourceDir $dailyLambdaDir -ZipPath "$OutputDir/daily_notifications.zip"

Remove-Item -Recurse -Force $mainLambdaDir, $dailyLambdaDir

Write-Host "Build completed successfully." -ForegroundColor Green
