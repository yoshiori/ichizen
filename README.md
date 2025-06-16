# Ichizen - Today's Small Good Deed 🌱

A heartwarming mobile app that encourages users to perform one small act of kindness each day, creating a sense of positive impact and gentle community connection.

## ✨ Overview

Ichizen (「今日の小さな善行」) provides users with **"a feeling that the world is getting a little bit better"** through small daily good deeds. Users receive one suggested good deed each day, complete it with a satisfying "DONE!" experience, and contribute to a global counter of kindness.

### Key Features

- 📱 **Daily Task Suggestions** - Cloud-powered random good deed selection
- 🔄 **One-Time Refresh** - Change your daily task once per day
- ✨ **Celebration Feedback** - Sparkle animations and positive messages
- 🌍 **Global Impact Counter** - Real-time worldwide kindness tracking
- 🌐 **Multilingual Support** - Japanese and English with i18n infrastructure
- 💙 **Gentle UX** - Focused on joy and positivity, not competition
- 👥 **Follow System** - Gentle notifications when friends complete good deeds
- 📊 **Personal History** - Track your journey of kindness

## 🚀 Current Status

**Development: Near Production-Ready** 🎉

The app is **feature-complete** with full React Native Android support achieved through successful **React Native Firebase migration** and **Turborepo optimization**:

### 🎯 Next Steps

- **iOS Testing** - Verify iOS builds and deployment
- **App Store Preparation** - Finalize store assets and metadata
- **Production Launch** - Deploy to app stores

For detailed roadmap, see [`docs/CHANGELOG.md`](docs/CHANGELOG.md).

### ✅ Completed Features

- **🎯 Complete Android Support** - Expo Development Build + APK builds tested
- **🔥 React Native Firebase Integration** - Native SDK with enhanced performance
- **⚡ Turborepo Monorepo** - High-performance builds with intelligent caching
- **✅ Comprehensive Test Coverage** - Extensive test suites with high success rate
- **🌏 Multi-language Support** - Complete Japanese/English translations
- **🎨 Complete UI/UX** - All core screens and native components
- **🔐 Authentication System** - Anonymous, Google, Apple sign-in ready
- **☁️ Real-time Backend** - Native Firestore + Cloud Functions

## 🛠 Tech Stack

### Frontend

- **React Native** + **TypeScript** + **Expo Development Build**
- **React Native Firebase SDK** for native performance
- **react-i18next** for internationalization

### Backend

- **Firebase Authentication** - Anonymous user authentication
- **Cloud Firestore** - Real-time database with security rules
- **Cloud Functions** - TypeScript serverless functions

### DevOps

- **Turborepo** - High-performance monorepo with intelligent caching
- **Jest** + **React Native Testing Library** - Comprehensive test coverage
- **GitHub Actions** - Automated CI/CD pipeline
- **ESLint** + **TypeScript** - Code quality assurance

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 20+
- npm 10+
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

```bash
# Clone the repository
git clone https://github.com/yoshiori/ichizen.git
cd ichizen

# Install dependencies for all packages
npm install

# Start development servers (parallel execution)
npm run dev
```

### Development Commands

```bash
# Build all packages (Turborepo parallel execution)
npm run build

# Run all tests
npm run test

# Type checking and linting
npm run typecheck
npm run lint

# Mobile development
npm run mobile:dev          # Mobile app development server
npm run android             # Android build with Turborepo
npm run ios                 # iOS build with Turborepo

# Backend development
npm run functions:dev       # Cloud Functions development
npm run functions:deploy    # Deploy functions with Turbo optimization
```

### Firebase Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Start Firebase emulators
npx firebase emulators:start

# Setup initial development data
node scripts/setup-initial-data.js
```

## 📂 Project Structure

```
ichizen/ (Turborepo root)
├── apps/
│   ├── mobile/              # React Native app
│   └── functions/           # Cloud Functions (TypeScript)
├── docs/                    # Project documentation
│   ├── DEVELOPMENT.md       # Development guide
│   ├── ARCHITECTURE.md      # System design
│   ├── DEPLOYMENT.md        # Deployment procedures
│   └── CHANGELOG.md         # Development history
├── scripts/                 # Development utilities
├── turbo.json              # Turborepo configuration
├── firebase.json           # Firebase configuration
└── package.json            # Root package with workspaces
```

## 🎯 Development Philosophy

This project follows **Test-Driven Development (TDD)** principles:

1. **Test First** - Define expected behavior with tests
2. **Red-Green-Refactor** - Make tests pass, then improve
3. **Continuous Integration** - Automated testing on every commit
4. **Type Safety** - Comprehensive TypeScript coverage

**Current Coverage**: Comprehensive test suite with high success rate ✅

## 🚀 Deployment

### Automated Deployment

- **GitHub Actions** automatically deploys Cloud Functions on push to main
- **Turborepo** provides intelligent caching for faster CI/CD
- **Firebase CLI** manages database rules and indexes

### Manual Deployment

```bash
# Deploy Cloud Functions with Turborepo optimization
npm run functions:deploy

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy
```

## 🤝 Contributing

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

- **Development Status**: Near production-ready
- **Test Coverage**: Comprehensive test suite with high success rate
- **Supported Platforms**: Android (complete), iOS (ready)
- **Languages**: Japanese (primary), English (complete)
- **Performance**: High-performance deployment with Turborepo caching

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by the philosophy that **small, consistent positive actions create meaningful change**
- Built with emphasis on **gentle, non-competitive user experiences**
- Powered by React Native, Expo, Firebase, and Turborepo ecosystems

---

**"Small acts of kindness are the beginning of great change."** ✨

_Built with TDD principles, TypeScript safety, Turborepo performance, and a vision for a kinder world._

For detailed documentation, see the [`docs/`](docs/) directory.
