# Cloud Run Deployment Guide

## Prerequisites

1. **Google Cloud Account**: Sign up at https://cloud.google.com (free $300 credit)
2. **Google Cloud CLI**: Install from https://cloud.google.com/sdk/docs/install
3. **Docker Desktop**: Only needed if you want the manual Docker image workflow below

## Setup

### 1. Install Google Cloud SDK & Login

```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID (replace with your actual project ID)
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### 2. Configure Docker for Google Cloud

```bash
gcloud auth configure-docker
```

## Deployment Methods

### Method 1: Deploy from Source (Easiest)

```bash
# Deploy directly from source code (Cloud Build handles container creation)
gcloud run deploy xr-labtools \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1
```

### Method 2: Build & Deploy with Docker

```bash
# 1. Build the Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/xr-labtools:latest .

# 2. Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/xr-labtools:latest

# 3. Deploy to Cloud Run
gcloud run deploy xr-labtools \
  --image gcr.io/YOUR_PROJECT_ID/xr-labtools:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1
```

### Method 3: Use Deploy Script

```bash
# Make the script executable (Mac/Linux)
chmod +x deploy-cloudrun.sh

# Run deployment
./deploy-cloudrun.sh YOUR_PROJECT_ID
```

On Windows PowerShell:
```powershell
.\deploy-cloudrun.ps1 YOUR_PROJECT_ID
```

## Configuration Options

### Memory & CPU
- `--memory`: 256Mi, 512Mi, 1Gi, 2Gi, 4Gi, 8Gi
- `--cpu`: 1, 2, 4, 8
- Default: 512Mi RAM, 1 CPU (sufficient for most cases)

### Regions
Popular regions:
- `us-central1` (Iowa)
- `us-east1` (South Carolina)
- `europe-west1` (Belgium)
- `asia-northeast1` (Tokyo)

### Environment Variables (if needed)

```bash
gcloud run deploy xr-labtools \
  --source . \
  --region us-central1 \
  --set-env-vars="NODE_ENV=production"
```

## Custom Domain Setup

### 1. Map Domain to Cloud Run

```bash
gcloud run domain-mappings create \
  --service xr-labtools \
  --domain labtools.yourdomain.com \
  --region us-central1
```

### 2. Update DNS Records
Follow the instructions shown after running the command above to add DNS records.

## Monitoring & Logs

### View Logs
```bash
gcloud run services logs tail xr-labtools --region us-central1
```

### View in Console
https://console.cloud.google.com/run

## Pricing Estimate

**Free Tier (monthly):**
- 2 million requests
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds

**Beyond Free Tier:**
- ~$0.00002400 per request
- ~$0.00000250 per GB-second
- Typically $5-20/month for light traffic

## Update Deployment

Simply run the deploy command again:

```bash
gcloud run deploy xr-labtools --source . --region us-central1
```

Cloud Run will automatically create a new revision and switch traffic to it.

## Troubleshooting

### Build Fails
- Check Dockerfile syntax
- Ensure `next.config.js` has `output: 'standalone'`
- Check Node.js version compatibility

### Site Not Loading
- Verify service is running: `gcloud run services list`
- Check logs: `gcloud run services logs tail xr-labtools`
- Ensure port 8080 is exposed in Dockerfile

### Images Not Loading
- Verify `public/assets/` folder is included in build
- Check Next.js image configuration in `next.config.js`

## Rollback

```bash
# List revisions
gcloud run revisions list --service xr-labtools --region us-central1

# Route traffic to previous revision
gcloud run services update-traffic xr-labtools \
  --to-revisions REVISION_NAME=100 \
  --region us-central1
```

## Delete Service

```bash
gcloud run services delete xr-labtools --region us-central1
```

---

**Need Help?**
- Cloud Run Docs: https://cloud.google.com/run/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
