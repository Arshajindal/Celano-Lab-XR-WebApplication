#!/bin/bash

# Cloud Run Deployment Script
# Usage: ./deploy-cloudrun.sh YOUR_PROJECT_ID

set -e

# Check if project ID is provided
if [ -z "$1" ]; then
  echo "Error: Project ID required"
  echo "Usage: ./deploy-cloudrun.sh YOUR_PROJECT_ID"
  exit 1
fi

PROJECT_ID=$1
SERVICE_NAME="xr-labtools"
REGION="us-central1"

echo "🚀 Deploying XR-LabTools to Cloud Run..."
echo "Project ID: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

# Set project
gcloud config set project $PROJECT_ID

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --port 8080

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your service is available at:"
gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)'
