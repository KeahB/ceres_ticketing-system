# Setup Instructions - Ceres Bus Ticketing System

Follow these steps to get the system up and running on your local environment.

## 1. Backend Server Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    npm start
    ```
    *The server will run on `http://localhost:3000`.*

---

## 2. Mobile App Setup

1.  Navigate to the `mobile` directory:
    ```bash
    cd mobile
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Expo development server:
    ```bash
    npx expo start
    ```
4.  Use the **Expo Go** app on your phone (Android/iOS) to scan the QR code, or press `a` for Android emulator / `i` for iOS simulator.

---

## 3. Connecting Mobile to Backend

By default, the mobile app is configured to look for the backend at `http://localhost:3000`.

- **On a Physical Device**: Update the `BACKEND_URL` in `mobile/services/syncService.js` to your computer's local IP address (e.g., `http://192.168.1.5:3000`).
- **On Android Emulator**: Use `http://10.0.2.2:3000`.

---

## 4. How to Test

1.  **Generate a Ticket**: Open the app, go to "Generate Ticket", select a route, and click "Calculate Fare".
2.  **Save & Print**: Click "Save Ticket" on the preview screen. This stores it in the local SQLite database.
3.  **Sync**: Go back to the Home screen and click "SYNC WITH BACKEND".
4.  **Verify Backend**: Open your browser and go to `http://localhost:3000/tickets` to see the synced ticket data.
5.  **Check Reports**: Go to `http://localhost:3000/reports/daily` to see the earnings summary.
