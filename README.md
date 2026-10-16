# LifeSync

A cross-platform mobile app built with React Native (Expo) and Firebase that combines task and calendar management with expense tracking.

This was my first individual project, built to learn mobile development. The interface was designed in Figma first. The original idea was larger, so I scaled it down to a working core: user accounts and cloud-saved events work, while some other features are interface prototypes that use sample data.

## Features

### What Works
* 👤 User accounts: Sign up and log in with email and password using Firebase Authentication.
* 📅 Calendar and events: Add and delete events, which are saved to Firestore and tied to the user's account.
* 🗓️ Monthly calendar view: Browse months, with coloured dots marking days that have events.
* ✅ Daily task timeline: Weekly date strip with colour-coded task cards.

### Prototype Features (Interface and sample data only)
* 📊 Expense tracking and insights: Spending statistics by category, shown with sample data.
* ⏰ Alarm interface: A custom reminder and routine UI that doesn't trigger real alarms.
* 🌐 Social login buttons: Google, Apple, and Facebook buttons are UI only.

---

## Getting Started

### Prerequisites
* Node.js (LTS version)
* A Firebase project with Authentication (email/password) and Firestore enabled.
* The Expo Go app on your phone, or an Android/iOS emulator.

### Installation

1. Clone the repository:
   git clone https://github.com/VER-SI/LifeSync.git
   cd LifeSync

2. Install dependencies:
   npm install

3. Add your Firebase details. Copy the example file and fill in your own project's values:
   cp .env.example .env
   (Note: On Windows PowerShell, use copy .env.example .env). Then edit .env with your credentials:
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

4. Start the app:
   npx expo start
   (Scan the QR code with Expo Go, or press a for an Android emulator or i for an iOS simulator.)

---

## What I Learned
* Building a multi-screen mobile app with React Native and Expo Router.
* Connecting an app to Firebase for authentication and cloud storage.
* Turning a Figma design into working screens.
* Scoping a project: deciding which features to finish and which to leave as prototypes.

## Future Improvements
* Save expense data to Firestore so the statistics use real data.
* Make the alarm interface trigger real notifications.
* Add working Google, Apple, and Facebook sign-in.
* Complete the Profile, Settings, and Insights pages.
