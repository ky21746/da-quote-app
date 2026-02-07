# Manual Export Guide - Firebase Console

Since the Node.js scripts require authentication that isn't working, here are alternative methods to export your catalog data.

---

## 🌐 Method 1: Firebase Console Export (Easiest)

### Step 1: Open Firestore in Firebase Console
You already have it open! Go to:
```
https://console.firebase.google.com/project/discover-africa-quotation-app/firestore/data
```

### Step 2: Export Using Firebase CLI
```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login
firebase login

# Export Firestore data
firebase firestore:export gs://discover-africa-quotation-app.appspot.com/firestore-export

# Or export to local file
gcloud firestore export gs://discover-africa-quotation-app.appspot.com/firestore-export
```

### Step 3: Download the Export
The data will be in your Firebase Storage bucket.

---

## 💻 Method 2: Export from Within Your React App (Recommended)

I'll create a React component that runs in your app (already authenticated) to export the data.

### File: `src/components/Admin/ExportCatalogButton.tsx`

This component will:
1. Fetch all items from Firestore (using your existing auth)
2. Generate JSON and CSV files
3. Download them to your computer

**Advantages:**
- Uses your existing Firebase authentication
- No need for service account keys
- Works in the browser
- Can be added to your Admin panel

---

## 📱 Method 3: Use Existing App Context

Your app already has `PricingCatalogContext` that loads all items. We can add an export button there.

---

## 🔧 Method 4: Firebase Emulator Export

If you're using Firebase Emulator:
```bash
firebase emulators:export ./firestore-data
```

---

## Which method would you like me to implement?

**I recommend Method 2** - I'll create a React component that you can add to your Admin page. It will export everything with one click, no authentication issues.

Should I create that component?
