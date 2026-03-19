# Cloud Run Deployment Script (PowerShell)
# Usage: .\deploy-cloudrun.ps1 YOUR_PROJECT_ID

param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectId
)

$ServiceName = "xr-labtools"
$Region = "us-central1"

Write-Host "Deploying XR-LabTools to Cloud Run..." -ForegroundColor Green
Write-Host "Project ID: $ProjectId"
Write-Host "Service: $ServiceName"
Write-Host "Region: $Region"
Write-Host ""

# Set project
gcloud config set project $ProjectId

# Enable required services for source deploys.
gcloud services enable `
  run.googleapis.com `
  cloudbuild.googleapis.com `
  artifactregistry.googleapis.com

# Deploy to Cloud Run
gcloud run deploy $ServiceName `
  --source . `
  --region $Region `
  --platform managed `
  --allow-unauthenticated `
  --memory 512Mi `
  --cpu 1 `
  --timeout 300 `
  --max-instances 10 `
  --port 8080

Write-Host ""
Write-Host "Deployment complete." -ForegroundColor Green
Write-Host ""
Write-Host "Your service is available at:"
gcloud run services describe $ServiceName --region $Region --format='value(status.url)'
