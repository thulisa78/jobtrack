# JOBTRACK — Career Launchpad 🚀

A React + Firebase job application tracker for graduates and youth.

---

## 🔥 Firebase Setup (Required — ~5 minutes)

### Step 1 — Create a Firebase Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → give it a name (e.g. `jobtrack`) → Continue

### Step 2 — Enable Email/Password Authentication
1. In your Firebase project, click **Authentication** in the left sidebar
2. Click **"Get started"**
3. Under **Sign-in method**, click **Email/Password**
4. Toggle **Enable** → Save

### Step 3 — Create Firestore Database
1. Click **Firestore Database** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** → Next → Select a region → Done

### Step 4 — Get Your Firebase Config
1. Click the ⚙️ gear icon → **Project settings**
2. Scroll to **"Your apps"** → click the `</>` Web icon
3. Register your app (any nickname) → copy the `firebaseConfig` object

### Step 5 — Paste Config into App.jsx
Open `src/App.jsx` and find this block near the top:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  ...
};
```

Replace it with your actual config from Firebase.

---

## 🚀 Running the App

```bash
npm install
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

---

## ✨ Features

- 🔐 **Register & Login** — Firebase Email/Password Authentication
- ☁️ **Cloud Storage** — All applications saved to Firestore per user
- 📋 **Application Tracker** — Add, edit, delete job applications
- 📊 **Dashboard** — Stats, success rate, recent activity
- 📝 **CV Builder** — Multi-step CV builder with print/PDF export
- 🔔 **Job Alerts** — Curated SA graduate job listings
- 🌐 **Job Portals** — Quick links to top SA job boards
- 📱 **Responsive** — Works on mobile & desktop

---

## 🗂 Project Structure

```
jobtrack/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx        ← Main app (all components + Firebase logic)
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

---

## 🛡 Firestore Security (Production)

When you're ready to go live, update your Firestore Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /applications/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```
