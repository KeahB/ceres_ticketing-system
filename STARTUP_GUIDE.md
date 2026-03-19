# Ceres Liner Complete Startup Guide

## ✅ Step 1: Verify Prerequisites

```bash
# Check Node.js is installed
node --version
npm --version

# Should show versions like:
# v18.x.x or higher
# 9.x.x or higher
```

## 🚀 Step 2: Start the Backend Server

**This MUST be started first.**

```bash
cd backend
npm start
```

**Expected Output:**
```
Connected to the SQLite database.
Tickets table initialized.
Conductors table initialized.
Server is running on port 3000
```

✅ **Wait for "Server is running on port 3000"** before starting other apps.

If you get an error, check:
- Port 3000 is not already in use: `netstat -ano | findstr :3000`
- No permission issues for database file
- Node modules are installed: `npm install`

---

## 📱 Step 3: Start Mobile App (Conductor App)

**In a new terminal:**

```bash
cd mobile
npm start
```

**Expected Output:**
```
expo-server: Listening on http://localhost:19000
Expo dev server is running at...
```

**Then choose:**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web preview

✅ **Wait until the app loads on your device/emulator**

---

## 🌐 Step 4: Start Web Admin Dashboard

**In another new terminal:**

```bash
cd admin
npm start
```

**Expected Output:**
```
Compiled successfully!
webpack compiled with warnings

> Open http://localhost:3000
```

Or if port 3000 is taken, it might use:
```
On Your Network: http://192.168.x.x:3001
```

---

## 🔑 Login Credentials

### For Mobile App (Conductor)
1. **First time**: Click "CREATE ACCOUNT" to sign up
   - Enter: First Name, Last Name, Email, Phone, Location, Password
   - After signup, return to login
2. **Login**: Enter your full name (First Last) and click LOGIN

✅ **Important**: Use the EXACT same name format you signed up with

### For Web Admin Dashboard
1. Go to `http://localhost:3000` (or the provided URL)
2. Enter Password: `CERES2024`
3. You'll see the admin dashboard

⚠️ **Security**: Change this password in production! See [SECURITY.md](../SECURITY.md)

---

## 🔧 Troubleshooting

### Backend won't start

**Error: "Port 3000 already in use"**
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm start
```

**Error: "Database error"**
- Delete `backend/tickets.db` and restart
- Ensure backend folder has write permissions

### Mobile app can't connect to backend

**Common cause**: API URL pointing to wrong IP

**Fix**:
1. Find your machine's IP: `ipconfig`
2. Edit `mobile/config/apiConfig.js`
3. Uncomment the device IP line and update it
4. Save and reload the app

### Signup works but login fails

**Error: "Conductor not found"**
- Make sure backend is running (`npm start` in backend folder)
- Check that signup was actually successful (should see "Signup successful!" alert)
- Verify you're entering the EXACT same name format at login

### Sync error in console

**Error: "Failed to sync ticket"**
- Ensure backend server is running
- Check network connectivity
- Wait a few seconds and try again (auto-retry in place)

---

## 📊 Testing the Full Flow

### ✅ Complete Signup & Login Test

1. **Start Backend** (wait for "Server is running on port 3000")
2. **Start Mobile App**
3. **Click "CREATE ACCOUNT"**
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john@test.com`
   - Phone: `09123456789`
   - Location: `Route 1`
   - Password: `password123`
   - Click "SIGN UP"
   - Should see: "Signup successful!"
4. **Press OK** → Back to Login Screen
5. **Enter Name**: `John Doe`
6. **Click LOGIN**
   - Should see: "Welcome back, John!"
   - Should navigate to Home Screen

✅ **If you reach Home Screen, signup and login are working!**

---

## 🎯 Testing Ticket Sync

1. Sign up and login (see above)
2. On Home Screen, generate some test tickets
3. Check mobile console for sync messages
4. If error appears, check:
   - Backend is running: `npm start`
   - Network connectivity
   - API URL is correct in `mobile/config/apiConfig.js`

---

## 📱 Mobile App Dev Mode

Access dev menu (depends on platform):
- **Android Emulator**: Press ⌘D or Ctrl+M
- **iOS Simulator**: Press ⌘D
- **Web**: Open console with F12

---

## 🔐 Production Deployment

Before deploying:

1. Change admin password in `admin/src/pages/AdminLogin.js`
2. Update API endpoints to use HTTPS
3. Hash passwords with bcrypt
4. Implement JWT authentication
5.  Enable CORS restrictions

See [IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md) for full production checklist.

---

## 💡 Quick Commands Reference

```bash
# Terminal 1: Backend
cd backend && npm install && npm start

# Terminal 2: Mobile
cd mobile && npm install && npm start

# Terminal 3: Admin Web
cd admin && npm install && npm start

# Restart everything
cd backend && npm start &
cd mobile && npm start &
cd admin && npm start
```

---

## 📞 Support

All three apps should load without errors if:
✅ Node.js v18+ is installed
✅ All dependencies installed (`npm install` in each folder)
✅ Backend started first and fully initialized
✅ Network connectivity is good
✅ Ports 3000 are available (check with `netstat`)

**Need help?**
- Check terminal output for specific errors
- Ensure you followed Steps 1-4 in order
- Verify all three apps are in separate terminals
