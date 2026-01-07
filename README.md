# Board Game Collection App

A static single-page web application for managing your board game collection with Firebase authentication and Firestore backend.

## Features

- **User Authentication**: Create an account with username and password, or sign in to an existing account
- **Board Game Management**: Add, edit, and delete board games from your collection
- **Real-time Sync**: Your collection is automatically synced across devices via Firestore
- **Beautiful UI**: Responsive design with gradient backgrounds, smooth animations, and intuitive controls
- **No Email Required**: Simple username/password authentication without email verification

## Getting Started

### Prerequisites

You need a Firebase project. If you don't have one:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project"
3. Follow the setup wizard
4. Enable Firestore Database (start in test mode for development)
5. Note: This app uses custom username/password authentication stored in Firestore, not Firebase Authentication

### Setup Instructions

1. **Get Your Firebase Config**:
   - In Firebase Console, go to Project Settings (gear icon)
   - Copy your web app configuration

2. **Update the Firebase Config in index.html**:
   - Open `index.html` in a text editor
   - Find the `firebaseConfig` object (around line 220)
   - Replace the placeholder values with your actual Firebase credentials:
     ```javascript
     const firebaseConfig = {
         apiKey: "YOUR_API_KEY",
         authDomain: "YOUR_AUTH_DOMAIN",
         projectId: "YOUR_PROJECT_ID",
         storageBucket: "YOUR_STORAGE_BUCKET",
         messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
         appId: "YOUR_APP_ID"
     };
     ```

3. **Configure Firestore Security Rules**:
   - In Firebase Console, go to Firestore Database
   - Click on "Rules" tab
   - Replace the default rules with:
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /games/{document=**} {
           allow read, write: if request.auth == null;
         }
         match /users/{document=**} {
           allow read, write: if request.auth == null;
         }
         match /wantToPlay/{document=**} {
           allow read, write: if request.auth == null;
         }
         match /knowHowToPlay/{document=**} {
           allow read, write: if request.auth == null;
         }
       }
     }
     ```
   - Click "Publish"
   - **Note**: For development/testing only. In production, implement proper security rules based on your needs.

4. **Open the App**:
   - Simply open `index.html` in your web browser
   - No build process or server required!

## Usage

1. **Create an Account**: Click "Sign up" and enter a username (3+ characters) and password (6+ characters)
2. **Sign In**: Use your username and password to sign in
3. **Add Games**: Enter a board game name and click "Add"
4. **Edit Games**: Click the "Edit" button on any game to rename it
5. **Delete Games**: Click the "Delete" button to remove a game from your collection
6. **Sign Out**: Click "Sign Out" to log out

## Technical Details

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Firestore Database with custom authentication
- **Hosting**: Can be hosted on any static hosting service (Netlify, Vercel, GitHub Pages, etc.)

## Firestore Data Structure

### Collections

**games**
- `userId` (string): The user's unique ID
- `name` (string): The board game name
- `createdAt` (timestamp): When the game was added

**users**
- `userId` (string): A unique identifier for the user
- `username` (string): The user's username
- `password` (string): The user's password (stored in plain text - for development only)
- `createdAt` (timestamp): When the account was created

## Browser Support

Works on all modern browsers that support ES modules and Firebase SDK (Chrome, Firefox, Safari, Edge).

## Troubleshooting

- **"Permission denied" errors**: Make sure your Firestore security rules are set correctly
- **Games not loading**: Check that your Firebase config is correct
- **Can't create account**: Check that the username isn't already taken and meets the requirements (3+ characters)
- **Can't sign in**: Verify your username and password are correct

## Security Note

This app uses plain-text password storage for simplicity. **For production use**, you should:
- Hash passwords using bcrypt or similar
- Implement proper Firestore security rules
- Use HTTPS only
- Consider using Firebase Authentication instead of custom auth
