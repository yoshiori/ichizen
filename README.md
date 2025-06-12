# Ichizen - Today's Small Good Deed 🌱

A heartwarming mobile app that encourages users to perform one small act of kindness each day, creating a sense of positive impact and gentle community connection.

## 📱 Overview

Ichizen (「今日の小さな善行」) provides users with **"a feeling that the world is getting a little bit better"** through small daily good deeds. Users receive one suggested good deed each day, complete it with a satisfying "DONE!" experience, and contribute to a global counter of kindness.

### ✨ Features

- **Daily Task Suggestions** - Cloud-powered random good deed selection
- **One-Time Refresh** - Change your daily task once per day
- **Celebration Feedback** - Sparkle animations and positive messages
- **Global Impact Counter** - Real-time worldwide kindness tracking
- **Multilingual Support** - Japanese and English with i18n infrastructure
- **Gentle UX** - Focused on joy and positivity, not competition
- **Follow System** - Gentle notifications when friends complete good deeds
- **Personal History** - Track your journey of kindness

## 🚀 Current Status

The app is in **active development** with a fully functional implementation:

### ✅ Completed Features
- **Complete Firebase Integration** - Authentication, Firestore, Cloud Functions
- **Production-Ready Backend** - Deployed Cloud Functions with proper CI/CD
- **Comprehensive UI** - All core screens and components
- **Multi-language Support** - Complete Japanese/English translations
- **Robust Testing** - 131 tests passing, full TypeScript coverage
- **Development Tools** - Emulator support, automated testing, deployment

### 🔥 Live Demo
- **Cloud Functions**: [asia-northeast1-ichizen-daily-good-deeds.cloudfunctions.net](https://asia-northeast1-ichizen-daily-good-deeds.cloudfunctions.net)
- **Web App**: Available via Expo development server

## 🛠 Tech Stack

### Frontend
- **React Native** + **TypeScript** + **Expo**
- **react-i18next** for internationalization
- **Firebase SDK** for real-time data

### Backend
- **Firebase Authentication** - Anonymous user authentication
- **Cloud Firestore** - Real-time database with security rules
- **Cloud Functions** - TypeScript serverless functions
- **Firebase Emulator Suite** - Local development environment

### DevOps & Testing
- **Jest** + **React Native Testing Library** - 131 test cases
- **GitHub Actions** - Automated CI/CD pipeline
- **ESLint** + **TypeScript** - Code quality assurance
- **Development/Production** environments with proper config management

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Firebase CLI (for backend development)

### Installation

```bash
# Clone the repository
git clone https://github.com/yoshiori/ichizen.git
cd ichizen

# Install dependencies
cd apps/mobile
npm install

# Start development server
npx expo start --web  # For web browser
npx expo start        # For mobile (scan QR code with Expo Go)
```

### Backend Development

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Start Firebase emulators (from project root)
npx firebase emulators:start

# Setup initial development data
node scripts/setup-initial-data.js

# Run integration tests
node scripts/test-cloud-functions-integration.js
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📂 Project Structure

```
ichizen/
├── apps/
│   └── mobile/                 # React Native app
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── screens/        # App screens
│       │   ├── services/       # Firebase services
│       │   ├── contexts/       # React contexts
│       │   ├── config/         # Environment configs
│       │   ├── i18n/          # Internationalization
│       │   ├── types/         # TypeScript definitions
│       │   └── utils/         # Utility functions
│       └── __tests__/         # Comprehensive test suite
├── functions/                 # Cloud Functions (TypeScript)
│   ├── src/
│   │   └── index.ts          # Function implementations
│   └── lib/                  # Compiled JavaScript
├── scripts/                  # Development utilities
│   ├── setup-initial-data.js # Emulator data setup
│   └── test-cloud-functions-integration.js
├── firebase.json             # Firebase configuration
├── firestore.rules          # Security rules
├── firestore.indexes.json   # Database indexes
└── .github/workflows/       # CI/CD pipelines
```

## 🎯 Development Roadmap

### Phase 1: Foundation ✅ (Completed)
- [x] Core UI components with TDD approach
- [x] Multi-language support with react-i18next
- [x] Comprehensive test suite (131 tests)
- [x] TypeScript setup with strict type checking

### Phase 2: Backend Integration ✅ (Completed)
- [x] Firebase Authentication with anonymous sign-in
- [x] Cloud Firestore database with security rules
- [x] Cloud Functions for daily task logic
- [x] Global counter with real-time synchronization
- [x] Development/production environment separation

### Phase 3: Production Deployment ✅ (Completed)
- [x] GitHub Actions CI/CD pipeline
- [x] Automated Cloud Functions deployment
- [x] Firebase project configuration
- [x] Environment-specific configurations

### Phase 4: Social Features (Current Focus)
- [ ] Follow system implementation
- [ ] Push notification infrastructure
- [ ] Friend activity notifications
- [ ] Enhanced user profiles

### Phase 5: Polish & Scale
- [ ] Mobile app store deployment
- [ ] Performance optimizations
- [ ] Additional task categories
- [ ] Seasonal events and themes
- [ ] Analytics and insights

## 🧪 Development Philosophy

This project follows **Test-Driven Development (TDD)** principles:

1. **Test First** - Define expected behavior with tests
2. **Red-Green-Refactor** - Make tests pass, then improve
3. **Continuous Integration** - Automated testing on every commit
4. **Type Safety** - Comprehensive TypeScript coverage

**Current Coverage**: 131 tests passing, 10 skipped ✅

## 🔧 Available Scripts

### Mobile App (apps/mobile/)
```bash
npm start          # Start Expo development server
npm test           # Run test suite
npm run typecheck  # TypeScript validation
npm run lint       # Code linting
```

### Cloud Functions (functions/)
```bash
npm run build      # Compile TypeScript
npm run serve      # Local emulator
npm run deploy     # Deploy to Firebase
npm run lint       # ESLint validation
```

### Development Scripts (scripts/)
```bash
node setup-initial-data.js                    # Setup test data
node test-cloud-functions-integration.js      # End-to-end testing
```

## 🌏 Internationalization

Complete multi-language support with infrastructure for expansion:

- 🇯🇵 **Japanese** (Primary) - Native language support
- 🇺🇸 **English** (Secondary) - Full translation coverage
- 🔮 **Future Languages** - Easy addition via i18next configuration

## 🚀 Deployment

### Automated Deployment
- **GitHub Actions** automatically deploys Cloud Functions on push to main
- **Firebase CLI** manages database rules and indexes
- **Environment Variables** handle configuration differences

### Manual Deployment
```bash
# Deploy Cloud Functions
firebase deploy --only functions

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy
```

## 🤝 Contributing

This project welcomes contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch with descriptive name
3. **Write tests** for new functionality (TDD approach)
4. **Ensure** all tests pass (`npm test`)
5. **Verify** TypeScript compilation (`npm run typecheck`)
6. **Submit** a pull request with clear description

### Code Standards
- **TypeScript** for type safety
- **ESLint** configuration adherence
- **Test coverage** for new features
- **English comments** in code
- **Semantic commit messages**

## 📊 Project Metrics

- **Source Files**: 23+ TypeScript/TSX files
- **Test Coverage**: 131 tests passing
- **Cloud Functions**: 3 deployed functions
- **Database Collections**: 4 primary collections
- **Supported Languages**: 2 (Japanese, English)
- **Development Time**: Active since 2025

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the philosophy that **small, consistent positive actions create meaningful change**
- Built with emphasis on **gentle, non-competitive user experiences**
- Powered by the React Native, Expo, and Firebase ecosystems
- Developed with love for creating technology that brings out the best in people

---

**"Small acts of kindness are the beginning of great change."** ✨

*Built with TDD principles, TypeScript safety, and a vision for a kinder world.*