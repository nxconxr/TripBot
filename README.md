# TripBot AI - AI-Driven Travel Platform

The first fully AI-driven travel platform that replaces human travel agents. TripBot finds and books flights, hotels, and packages using GPT integration with live travel data.

## 🚀 Features

- **AI-Powered Travel Planning**: GPT integration for smart travel suggestions
- **Flight & Hotel Booking**: Real-time data from Travelpayouts and Booking.com
- **Modern UI/UX**: Apple-inspired dark mode design with smooth animations
- **Multi-Payment Support**: Stripe, Klarna, PayPal, Apple Pay, SEPA
- **Favorites & Sync**: Local storage with Firebase sync
- **Travel Hacks**: AI-generated PDFs with booking tips
- **Live Tools**: Flight status tracking and emergency assistance

## 🏗️ Project Structure

```
tripbot-ai/
├── frontend/                 # Flutter app (iOS + Android)
│   ├── lib/
│   │   ├── main.dart
│   │   ├── screens/
│   │   ├── widgets/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   ├── pubspec.yaml
│   └── assets/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   ├── package.json
│   └── .env.example
├── docs/                     # Documentation
└── README.md
```

## 🛠️ Tech Stack

- **Frontend**: Flutter (iOS + Android)
- **Backend**: Node.js + Express
- **Database**: Firebase (Auth, Favorites, Sync)
- **APIs**: 
  - OpenRouter (GPT integration)
  - Travelpayouts/Skyscanner (Flights)
  - Booking.com/Check24 (Hotels)
  - Geoapify (IATA Autocomplete)
- **Payments**: Stripe, Klarna, PayPal, Apple Pay, SEPA

## 📋 Prerequisites

- Flutter SDK (3.16+)
- Node.js (18+)
- Firebase CLI
- Git
- VS Code (recommended)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd tripbot-ai
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
flutter pub get
flutter run
```

## 📱 Development

### Backend Development
- API runs on `http://localhost:3000`
- Hot reload enabled
- Environment variables in `.env`

### Frontend Development
- Flutter app with hot reload
- iOS Simulator or Android Emulator
- Real device testing recommended

## 🔧 Environment Variables

Create `.env` file in backend directory:

```env
# Server
PORT=3000
NODE_ENV=development

# OpenAI/OpenRouter
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Travel APIs
TRAVELPAYOUTS_TOKEN=your_travelpayouts_token
BOOKING_API_KEY=your_booking_api_key
GEOAPIFY_API_KEY=your_geoapify_api_key

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# JWT
JWT_SECRET=your_jwt_secret
```

## 📦 API Endpoints

### GPT Integration
- `POST /api/gpt/travel-suggestion` - Generate travel suggestions
- `POST /api/gpt/travel-hacks` - Generate travel tips PDF

### Flights
- `GET /api/flights/search` - Search flights
- `GET /api/flights/status` - Get flight status

### Hotels
- `GET /api/hotels/search` - Search hotels
- `GET /api/hotels/details` - Get hotel details

### User Management
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/user/favorites` - Get user favorites
- `POST /api/user/favorites` - Add to favorites

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment

## 🎨 UI/UX Design

- **Dark Mode First**: Modern dark theme by default
- **Apple-Inspired**: Clean, minimalistic design
- **Smooth Animations**: Fluid transitions and micro-interactions
- **Card-Based**: Swipeable travel cards
- **Responsive**: Optimized for mobile and tablet

## 🚀 Deployment

### Backend Deployment
1. Deploy to Heroku, Railway, or Vercel
2. Set environment variables
3. Configure domain

### Frontend Deployment
1. Build Flutter app: `flutter build apk` / `flutter build ios`
2. Deploy to App Store / Play Store
3. Configure Firebase project

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact: support@tripbot.ai

---

**TripBot AI** - Making travel planning effortless with AI 🚀✈️🏨