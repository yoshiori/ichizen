# Deployment Guide

## 🚀 Production Deployment

### Firebase Project Setup

#### 1. Create Firebase Project

```bash
# Login to Firebase
firebase login

# Create new project
firebase projects:create ichizen-prod

# Set project for deployment
firebase use ichizen-prod
```

#### 2. Enable Required Services

```bash
# Enable Firebase services
firebase use ichizen-prod

# Enable Authentication
firebase auth:set --project ichizen-prod

# Enable Firestore
gcloud firestore databases create --location=asia-northeast1 --project=ichizen-prod

# Enable Cloud Functions
gcloud services enable cloudfunctions.googleapis.com --project=ichizen-prod

# Enable Firebase Cloud Messaging
gcloud services enable fcm.googleapis.com --project=ichizen-prod
```

#### 3. Configure Environment Variables

Create `.env.production` in project root:

```bash
# Production Firebase Configuration
FIREBASE_PROJECT_ID=ichizen-prod
FIREBASE_AUTH_DOMAIN=ichizen-prod.firebaseapp.com
FIREBASE_DATABASE_URL=https://ichizen-prod-default-rtdb.asia-southeast1.firebasedatabase.app
FIREBASE_STORAGE_BUCKET=ichizen-prod.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

**Security**: Never commit `.env.production` to git. Use CI/CD secrets instead.

## ☁️ Cloud Functions Deployment

### Automated Deployment (Recommended)

```bash
# Deploy with Turborepo optimization (96ms with cache)
npm run functions:deploy

# Deploy specific functions only
firebase deploy --only functions:getTodayTask,functions:completeTask

# Deploy with debug output
npm run functions:deploy -- --debug
```

### Manual Deployment Steps

```bash
# 1. Build and test
cd apps/functions
npm run build
npm run test

# 2. Deploy to Firebase
firebase deploy --only functions

# 3. Verify deployment
firebase functions:log --limit 10
```

### Function Configuration

```bash
# Set environment variables for functions
firebase functions:config:set \
  app.environment="production" \
  app.timezone="Asia/Tokyo"

# Deploy configuration
firebase deploy --only functions
```

## 📱 Mobile App Deployment

### Android Deployment

#### 1. Generate Release APK

```bash
# Build for production
cd apps/mobile
npm run android:build:release

# Generate signed APK
npm run android:build:signed
```

#### 2. Google Play Console

1. **Create App Listing**

   - App name: "Ichizen - Today's Small Good Deed"
   - Description: Upload from `docs/store-descriptions/google-play.md`
   - Screenshots: Upload from `assets/screenshots/android/`
   - App icon: Upload `assets/icons/android/ic_launcher.png`

2. **Upload APK**
   - Upload `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`
   - Set version code and version name
   - Complete compliance forms

### iOS Deployment

#### 1. Build for App Store

```bash
# Build iOS release
cd apps/mobile
npm run ios:build:release

# Archive for App Store
npm run ios:archive
```

#### 2. App Store Connect

1. **Create App Record**

   - App name: "Ichizen - Today's Small Good Deed"
   - Bundle ID: `dev.yoshiori.ichizen`
   - Description: Upload from `docs/store-descriptions/app-store.md`
   - Screenshots: Upload from `assets/screenshots/ios/`

2. **Upload Build**
   - Use Xcode or Application Loader
   - Upload `.ipa` file from archive
   - Submit for review

## 🗃 Database Deployment

### Firestore Setup

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# Setup initial data
node scripts/setup-production-data.js
```

### Production Data Structure

```javascript
// Initial task data
const productionTasks = [
  {
    id: "task001",
    text: {ja: "ありがとうを一回言う", en: "Say thank you once"},
    category: "kindness",
    difficulty: "easy",
  },
  // ... more tasks
];

// Global counter initialization
const globalCounter = {
  date: "2025-06-16",
  totalCount: 0,
  lastUpdated: new Date(),
};
```

### Security Rules Deployment

```bash
# Test rules locally
firebase emulators:start --only firestore

# Deploy to production
firebase deploy --only firestore:rules

# Verify rules
firebase firestore:rules get
```

## 🔧 CI/CD Pipeline

### GitHub Actions Configuration

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - run: npm ci
      - run: npm run test
      - run: npm run typecheck
      - run: npm run lint

  deploy-functions:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - run: npm ci
      - run: npm run functions:build

      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: "${{ secrets.GITHUB_TOKEN }}"
          firebaseServiceAccount: "${{ secrets.FIREBASE_SERVICE_ACCOUNT }}"
          projectId: ichizen-prod

  build-mobile:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - run: npm ci
      - run: npm run mobile:build

      - uses: actions/upload-artifact@v4
        with:
          name: mobile-build
          path: apps/mobile/dist/
```

### Required GitHub Secrets

```bash
# Firebase service account (JSON key)
FIREBASE_SERVICE_ACCOUNT

# Google Play Console (JSON key)
GOOGLE_PLAY_SERVICE_ACCOUNT

# App Store Connect API key
APP_STORE_CONNECT_API_KEY
APP_STORE_CONNECT_ISSUER_ID
APP_STORE_CONNECT_KEY_ID

# Production environment variables
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_PROJECT_ID
# ... other Firebase config
```

## 🔒 Security Deployment

### API Key Management

```bash
# Create restricted API key for production
gcloud auth login
gcloud config set project ichizen-prod

# Create API key with restrictions
gcloud alpha services api-keys create \
  --display-name="Ichizen Production" \
  --api-target="firebase.googleapis.com" \
  --allowed-referrers="dev.yoshiori.ichizen,ichizen-prod.firebaseapp.com"

# Get the API key
gcloud alpha services api-keys list
```

### Firebase Security Configuration

```javascript
// firestore.rules - Production security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Task history is user-specific
    match /daily_task_history/{historyId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Tasks are read-only for authenticated users
    match /tasks/{taskId} {
      allow read: if request.auth != null;
    }

    // Global counter is read-only
    match /global_counter/{counterId} {
      allow read: if request.auth != null;
      allow write: if false; // Only Cloud Functions can write
    }

    // Follow relationships
    match /follows/{followId} {
      allow read, write: if request.auth != null &&
        (resource.data.followerId == request.auth.uid ||
         resource.data.followingId == request.auth.uid);
    }
  }
}
```

## 📊 Monitoring & Analytics

### Firebase Analytics Setup

```bash
# Enable Analytics
gcloud services enable firebaseanalytics.googleapis.com --project=ichizen-prod

# Configure custom events
firebase analyticsconfig:set --project=ichizen-prod
```

### Performance Monitoring

```bash
# Enable Performance Monitoring
gcloud services enable firebaseperf.googleapis.com --project=ichizen-prod

# Monitor key metrics:
# - App startup time
# - Task completion flow
# - Network request performance
```

### Error Reporting

```bash
# Enable Crashlytics
gcloud services enable crashlytics.googleapis.com --project=ichizen-prod

# Monitor in Firebase Console:
# - Crash-free users percentage
# - Most impacted versions
# - Error clustering
```

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (148/151 tests)
- [ ] TypeScript compilation successful
- [ ] ESLint warnings resolved
- [ ] Environment variables configured
- [ ] Firebase project setup complete
- [ ] Security rules tested

### Cloud Functions Deployment

- [ ] Functions build successfully
- [ ] Environment variables set
- [ ] Deploy to staging first
- [ ] Verify function endpoints
- [ ] Check function logs
- [ ] Performance monitoring enabled

### Mobile App Deployment

- [ ] App icons generated (all sizes)
- [ ] Screenshots captured (all devices)
- [ ] Store descriptions written
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] App signing configured

### Post-Deployment

- [ ] Smoke tests completed
- [ ] Analytics tracking verified
- [ ] Error monitoring enabled
- [ ] Performance baselines established
- [ ] User feedback channels setup

## 🔄 Rollback Procedures

### Cloud Functions Rollback

```bash
# List function versions
firebase functions:list

# Rollback specific function
firebase deploy --only functions:getTodayTask --force

# Rollback all functions to previous version
firebase functions:rollback --version previous
```

### Mobile App Rollback

```bash
# Android: Upload previous APK version
# iOS: Use App Store Connect to revert to previous build
```

### Database Rollback

```bash
# Export current data
gcloud firestore export gs://ichizen-prod-backup/$(date +%Y%m%d)

# Restore from backup
gcloud firestore import gs://ichizen-prod-backup/20250615
```

## 📈 Scaling Considerations

### Auto-scaling Configuration

- **Cloud Functions**: Automatic scaling (0-1000 concurrent)
- **Firestore**: Automatic scaling with usage-based pricing
- **Firebase Hosting**: Global CDN with automatic scaling

### Performance Optimization

- **Function cold starts**: Keep functions warm with scheduled calls
- **Database queries**: Optimize with proper indexing
- **Mobile performance**: Monitor with Firebase Performance SDK

For development procedures, see [`DEVELOPMENT.md`](DEVELOPMENT.md).
For system architecture, see [`ARCHITECTURE.md`](ARCHITECTURE.md).
