# Ichizen - Today's Small Good Deed 🌱

A heartwarming mobile app that encourages users to perform one small act of kindness each day, creating a sense of positive impact and gentle community connection.

## 📱 Overview

Ichizen (「今日の小さな善行」) provides users with **"a feeling that the world is getting a little bit better"** through small daily good deeds. Users receive one suggested good deed each day, complete it with a satisfying "DONE!" experience, and contribute to a global counter of kindness.

### ✨ Features

- **Daily Task Suggestions** - Random good deed from curated categories
- **One-Time Refresh** - Change your daily task once per day
- **Celebration Feedback** - Sparkle animations and positive messages
- **Global Impact Counter** - See how your actions contribute worldwide
- **Multilingual Support** - Japanese and English
- **Gentle UX** - Focused on joy and positivity, not competition

## 🚀 Demo

The app is currently in development with a fully functional prototype featuring:

- ✅ Complete UI components with animations
- ✅ Sample task system with 8 different good deeds
- ✅ Multi-language support (Japanese/English)
- ✅ Comprehensive test suite (20 tests)
- ✅ Web-compatible for easy testing

## 🛠 Tech Stack

- **Frontend**: React Native + TypeScript + Expo
- **Testing**: Jest + React Native Testing Library
- **Internationalization**: react-i18next
- **Planned Backend**: Firebase (Authentication + Firestore + Cloud Functions)
- **Development**: TDD approach with full test coverage

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI

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

### Testing

```bash
# Run all tests
npm test

# Type checking
npm run typecheck
```

## 📂 Project Structure

```
ichizen/
├── apps/
│   └── mobile/                 # React Native app
│       ├── src/
│       │   ├── components/     # UI components
│       │   ├── screens/        # App screens
│       │   ├── i18n/          # Internationalization
│       │   ├── types/         # TypeScript types
│       │   └── data/          # Sample data
│       └── __tests__/         # Test files
├── functions/                 # Cloud Functions (planned)
└── docs/                      # Documentation
```

## 🎯 Roadmap

### Phase 1: Prototype ✅ (Completed)
- [x] Core UI components with TDD
- [x] Multi-language support
- [x] Working demo app
- [x] Comprehensive test suite

### Phase 2: Backend Integration (Next)
- [ ] Firebase Authentication
- [ ] Cloud Firestore database
- [ ] Daily task selection logic
- [ ] Global counter synchronization

### Phase 3: Social Features
- [ ] Follow system (one-way, privacy-focused)
- [ ] Friend notifications
- [ ] Personal history calendar

### Phase 4: Enhancement
- [ ] More task categories
- [ ] Seasonal events
- [ ] Advanced analytics

## 🧪 Development Philosophy

This project follows **Test-Driven Development (TDD)** principles:

1. Write tests first to define expected behavior
2. Implement features to make tests pass
3. Refactor while maintaining test coverage
4. Commit when tests are green

Current test coverage: **20/20 tests passing** ✅

## 🌏 Internationalization

The app supports multiple languages with plans for expansion:

- 🇯🇵 **Japanese** (Primary) - Complete translations
- 🇺🇸 **English** (Secondary) - Complete translations
- 🔮 **Future**: More languages based on user demand

## 🤝 Contributing

This is currently a personal project, but contributions and feedback are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the philosophy of small, consistent positive actions
- Built with love for creating gentle, meaningful user experiences
- Special thanks to the React Native and Expo communities

---

**"Small acts of kindness are the beginning of great change."** ✨