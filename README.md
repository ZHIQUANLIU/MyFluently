# 🎙 Fluently: AI-Powered English Mastery

Fluently is a smart, personalised Android application built with React Native and Expo. Powered by Google's Gemini multimodal AI, Fluently assesses your spoken English—analysing pronunciation, grammar, fluency, and vocabulary distribution—to generate a tailored 3-month study plan.

---

## ✨ Features

- **Personalised Assessment**: Enter your English level (A1-C2) and profession (e.g. Software Engineer). Gemini generates dynamic, context-aware interview questions.
- **Multimodal Voice Analysis**: Record your answers directly within the app. Gemini 1.5 Pro analyses your audio without needing a separate Speech-to-Text layer.
- **Comprehensive Scoring**: Visualise your performance with animated SVG rings covering Pronunciation, Grammar, Fluency, and Vocabulary CEFR distribution.
- **AI-Crafted Study Plan**: Based on your weak areas (scores < 85) and topics of interest, the app generates a progressive, actionable 12-week (36-session) study curriculum.
- **Progress Tracking**: A sleek, glassmorphic dashboard tracks your daily tasks, completed sessions, and overall improvements.
- **Local Privacy**: Profiles, scores, and plans are stored directly on your device via AsyncStorage. Only your API key and audio data are sent securely to Google AI Studio.

---

## 🛠 Tech Stack

- **Frontend Framework**: [React Native](https://reactnative.dev/) (via [Expo](https://expo.dev/))
- **Language**: TypeScript
- **AI / LLM Integration**: `@google/generative-ai` (Gemini 1.5 Flash / Pro)
- **Audio Recording**: `expo-av`, `expo-file-system`
- **Animations / SVG**: `react-native-reanimated`, `react-native-svg`
- **Navigation**: `@react-navigation/native-stack`
- **Build System**: Android Gradle with Java 17

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (LTS)
- [Java 17](https://aka.ms/download-JDK/microsoft-JDK-17.0.18-windows-x64.msi) (Required for Android native compilation)
- [Android SDK](https://developer.android.com/studio) (If building locally)

### 2. Installation
Clone the repository and install the dependencies:
```bash
cd MyFluently
npm install --legacy-peer-deps
```

### 3. Run for Development
To test the app using **Expo Go**:
```bash
npm start
```
Scan the QR code with your phone.

### 4. Build for Production (APK)
To generate a standalone APK:
```bash
# Generate native android directory
npx expo prebuild --platform android

# Compile APK (requires Java 17)
cd android
.\gradlew assembleRelease
```
The APK will be located at: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📁 Project Structure

```
MyFluently/
├── android/                 # Native Android project files (generated)
├── src/
│   ├── components/          # Reusable UI components (GlassCards, ScoreRings)
│   ├── constants/           # Colors, Professions, CEFR Levels
│   ├── screens/             # UI Screens (Onboarding, Assessment, Dashboard)
│   ├── services/            # Gemini API, AsyncStorage, Audio logic
│   ├── store/               # Global state (AppContext)
│   └── types/               # TypeScript interfaces
├── App.tsx                  # Main entry & Navigation
└── README.md                # Project documentation
```

---

## 🛠 Troubleshooting Note
If you encounter CMake or JNI errors during the build process on Windows, ensure your `JAVA_HOME` is pointed to **Java 17**. Java 24+ may cause restricted JNI method errors during NDK compilation.
