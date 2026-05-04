# 🎙 MyFluently: AI-Powered English Mastery

MyFluently is a next-generation English learning application that combines the power of **Google Gemini's** multimodal analysis with **DeepSeek V4-Flash's** advanced reasoning. It assesses your spoken English—analysing pronunciation, grammar, fluency, and vocabulary distribution—to build a personalized 3-month path to fluency.

---

## ✨ Features

- **🎯 Dual-Engine AI Support**:
  - **Google Gemini**: Powers multimodal audio analysis, listening directly to your voice to evaluate pronunciation and fluency.
  - **DeepSeek V4-Flash**: Drives high-speed text generation for personalized study plans and dynamic interview scenarios.
- **📊 Professional Assessment**:
  - Situational speaking questions tailored to your profession (e.g., Software Engineer, Marketing Manager).
  - Verbatim transcription and CEFR-level vocabulary breakdown (A1-C2).
- **👔 Interview Practice Mode**:
  - Role-specific mock interviews for positions like "Senior Frontend Developer" or "Project Manager".
  - Specialized scoring for **Confidence**, **Fluency**, and **Description Clarity**.
- **📚 Interactive Practice**:
  - Topic-based conversation practice on 20+ categories or custom interests.
- **🗓 AI-Crafted 3-Month Plan**:
  - A 12-week curriculum (36 sessions) generated based on your weak areas (scores < 85) and personal interests.
- **💎 Premium Glassmorphism UI**:
  - A stunning, modern interface with interactive SVG score rings, subtle gradients, and smooth transitions.
- **🔒 Privacy First**:
  - All profile data and assessment history are stored locally on your device.

---

## 🛠 Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo SDK 54](https://expo.dev/)
- **AI Models**:
  - **Google Gemini 2.5 Flash / 1.5 Pro** (Multimodal evaluation)
  - **DeepSeek V4-Flash** (Reasoning and generation)
- **Audio Processing**: `expo-av` & `expo-file-system`
- **Graphics & Animation**: `react-native-reanimated`, `react-native-svg`, `@shopify/react-native-skia`
- **State Management**: React Context API + AsyncStorage
- **Navigation**: React Navigation 7 (Native Stack)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (LTS)
- **Java 17** (Required for Android native compilation)
- **Android SDK** (For local builds)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/ZHIQUANLIU/MyFluently.git
cd MyFluently

# Install dependencies
npm install --legacy-peer-deps
```

### 3. API Configuration
To use the app, you need at least one API key:
- **Gemini Key**: Get it at [Google AI Studio](https://aistudio.google.com/) (Required for audio analysis).
- **DeepSeek Key**: Get it at [DeepSeek Platform](https://platform.deepseek.com/) (Optional, for V4-Flash features).

Enter your keys in the app's **Settings** or during the initial onboarding.

### 4. Running the App
```bash
# Start Expo development server
npx expo start
```
Scan the QR code with the **Expo Go** app on your phone.

---

## 📁 Project Structure

```
MyFluently/
├── src/
│   ├── components/  # GlassCard, ScoreRing, Badge, UI components
│   ├── constants/   # Theme colors, topic suggestions, levels
│   ├── screens/     # Dashboard, Assessment, Interview, Settings
│   ├── services/    # ai.ts (Coordinator), gemini.ts, deepseek.ts
│   ├── store/       # AppContext (Global State)
│   ├── utils/       # ID generation, formatting helpers
│   └── types/       # TypeScript interfaces
├── App.tsx          # Root Navigation Container
└── package.json     # Project dependencies
```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
