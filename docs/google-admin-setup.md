# Google Admin Setup Guide

## Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project named "OpenClassroom Monitor"
3. Note down the Project ID

## Step 2: Enable Required APIs
1. Go to [API Library](https://console.cloud.google.com/apis/library)
2. Search for and enable these APIs:
   - Admin SDK API
   - Chrome Management API
   - Directory API

## Step 3: Create Service Account
1. Go to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "Create Service Account"
3. Name: `openclassroom-monitor`
4. Description: "Service account for OpenClassroom Monitor"
5. Click "Create and Continue"
6. Role: Project > Editor
7. Click "Done"

## Step 4: Create and Download Key
1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose JSON format
5. Save the downloaded file as `google-credentials.json`

## Step 5: Configure Google Workspace
1. Go to [Google Admin Console](https://admin.google.com)
2. Go to Security > Access and data control > API Controls
3. Click "Manage Domain Wide Delegation"
4. Add new API client:
   - Client ID: (from service account)
   - OAuth Scopes:
     ```
     https://www.googleapis.com/auth/admin.directory.device.chromeos
     https://www.googleapis.com/auth/admin.directory.orgunit
     https://www.googleapis.com/auth/admin.directory.user
     ```

## Step 6: Configure Application
1. Copy `google-credentials.json` to `backend/config/` directory
2. Create `.env` file in backend directory with:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./config/google-credentials.json
   GOOGLE_ADMIN_EMAIL=your-admin@domain.com
   ORG_UNIT_PATH=/Students
   ```
