# TripBot AI - Setup Instructions

This document provides step-by-step instructions to set up and run the TripBot AI application.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Flutter SDK** (v3.16 or higher) - [Download here](https://flutter.dev/docs/get-started/install)
- **Git** - [Download here](https://git-scm.com/)
- **VS Code** (recommended) - [Download here](https://code.visualstudio.com/)

### Optional Software
- **Firebase CLI** - `npm install -g firebase-tools`
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## Project Structure

```
tripbot-ai/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── .env.example
├── frontend/               # Flutter mobile app
│   ├── lib/
│   │   ├── screens/        # App screens
│   │   ├── widgets/        # Reusable widgets
│   │   ├── models/         # Data models
│   │   ├── services/       # API services
│   │   └── utils/          # Utilities
│   ├── pubspec.yaml
│   └── assets/
└── docs/                   # Documentation
```

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

1. Copy the environment example file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your API keys:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# OpenAI/OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=gpt-4

# Travel APIs
TRAVELPAYOUTS_TOKEN=your_travelpayouts_token_here
TRAVELPAYOUTS_BASE_URL=https://api.travelpayouts.com/v1
SKYSCANNER_API_KEY=your_skyscanner_api_key_here
BOOKING_API_KEY=your_booking_api_key_here
BOOKING_BASE_URL=https://booking-com.p.rapidapi.com
GEOAPIFY_API_KEY=your_geoapify_api_key_here
GEOAPIFY_BASE_URL=https://api.geoapify.com/v1

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

### 3. API Keys Setup

#### OpenRouter (GPT Integration)
1. Go to [OpenRouter](https://openrouter.ai/)
2. Create an account and get your API key
3. Add the key to your `.env` file

#### Travelpayouts (Flight Data)
1. Go to [Travelpayouts](https://www.travelpayouts.com/)
2. Register and get your API token
3. Add the token to your `.env` file

#### Booking.com (Hotel Data)
1. Go to [RapidAPI Booking.com](https://rapidapi.com/3b-data-3b-data-default/api/booking-com/)
2. Subscribe to the API and get your key
3. Add the key to your `.env` file

#### Geoapify (Location Data)
1. Go to [Geoapify](https://www.geoapify.com/)
2. Create an account and get your API key
3. Add the key to your `.env` file

#### Stripe (Payments)
1. Go to [Stripe](https://stripe.com/)
2. Create an account and get your API keys
3. Add the keys to your `.env` file

#### Firebase (Authentication & Database)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication and Firestore
4. Create a service account and download the JSON file
5. Add the project ID and service account details to your `.env` file

### 4. Run the Backend

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

## Frontend Setup

### 1. Install Flutter Dependencies

```bash
cd frontend
flutter pub get
```

### 2. Firebase Configuration

1. In your Firebase project, add an Android and/or iOS app
2. Download the configuration files:
   - `google-services.json` for Android
   - `GoogleService-Info.plist` for iOS

3. Place the files in the appropriate directories:
   - Android: `frontend/android/app/google-services.json`
   - iOS: `frontend/ios/Runner/GoogleService-Info.plist`

### 3. Platform-Specific Setup

#### Android Setup

1. Update `frontend/android/app/build.gradle`:
```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        minSdkVersion 21
        targetSdkVersion 34
    }
}
```

2. Update `frontend/android/app/src/main/AndroidManifest.xml`:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <application
        android:label="TripBot AI"
        android:name="${applicationName}"
        android:icon="@mipmap/ic_launcher">
        <!-- ... rest of the manifest -->
    </application>
</manifest>
```

#### iOS Setup

1. Update `frontend/ios/Runner/Info.plist`:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs access to location to find nearby hotels and attractions.</string>
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera to take profile pictures.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to photo library to select profile pictures.</string>
```

### 4. Run the Flutter App

```bash
# Check if everything is set up correctly
flutter doctor

# Run on connected device or emulator
flutter run

# Run on specific platform
flutter run -d android
flutter run -d ios
```

## Development Workflow

### Backend Development

1. **Start the development server:**
```bash
cd backend
npm run dev
```

2. **API Testing:**
- Use Postman or curl to test endpoints
- Health check: `GET http://localhost:3000/health`
- API docs: `GET http://localhost:3000/`

3. **Logs:**
- Check console output for API requests
- Monitor error logs in the terminal

### Frontend Development

1. **Start the Flutter app:**
```bash
cd frontend
flutter run
```

2. **Hot Reload:**
- Press `r` in the terminal to hot reload
- Press `R` to hot restart

3. **Debugging:**
- Use VS Code Flutter extension
- Check Flutter Inspector for widget debugging
- Monitor network requests in DevTools

## Testing

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend
flutter test
```

## Building for Production

### Backend Deployment

1. **Build the application:**
```bash
cd backend
npm run build
```

2. **Deploy to your preferred platform:**
- Heroku: `git push heroku main`
- Railway: Connect your GitHub repository
- Vercel: `vercel --prod`

### Frontend Deployment

1. **Build for Android:**
```bash
cd frontend
flutter build apk --release
```

2. **Build for iOS:**
```bash
cd frontend
flutter build ios --release
```

3. **Publish to stores:**
- Follow [Flutter deployment guide](https://flutter.dev/docs/deployment)

## Troubleshooting

### Common Issues

1. **Port already in use:**
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

2. **Flutter dependencies issues:**
```bash
flutter clean
flutter pub get
```

3. **Firebase configuration issues:**
- Ensure `google-services.json` is in the correct location
- Check Firebase project settings
- Verify service account permissions

4. **API connection issues:**
- Check if backend is running on correct port
- Verify API keys in `.env` file
- Check network connectivity

### Getting Help

1. Check the logs in the terminal
2. Review the API documentation at `http://localhost:3000/`
3. Check Flutter doctor output: `flutter doctor -v`
4. Review Firebase console for authentication issues

## Next Steps

After successful setup:

1. **Explore the API:**
   - Visit `http://localhost:3000/` for API documentation
   - Test endpoints using Postman

2. **Test the App:**
   - Try the AI chat feature
   - Search for flights and hotels
   - Test user authentication

3. **Customize:**
   - Modify the theme in `frontend/lib/utils/theme.dart`
   - Add new API endpoints in `backend/src/routes/`
   - Customize the UI components

4. **Deploy:**
   - Set up CI/CD pipelines
   - Configure production environment variables
   - Deploy to app stores

## Support

For additional help:
- Check the [README.md](../README.md) for project overview
- Review the API documentation
- Open an issue in the repository