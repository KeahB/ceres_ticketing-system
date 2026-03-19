# Expo Go Setup for Ceres Liner - Real Device Guide

## ✅ Current Setup for Your Device

**Your Computer IP**: `192.168.1.11`
**Backend URL**: `http://192.168.1.11:3000`
**Status**: ✅ Backend is now running in background

---

## 🚀 Steps to Test Signup on Expo Go

### Step 1: Ensure Your Phone is on SAME WiFi
⚠️ **CRITICAL** - Your phone MUST be on the same Wi-Fi network as your computer

Check your phone's WiFi settings:
- WiFi Network: Should match your computer's network (e.g., "Home", "Office")
- Both devices should see the same network

### Step 2: Check Backend is Running

Open PowerShell and verify backend is responding:
```powershell
Invoke-WebRequest -Uri "http://192.168.1.11:3000/health" -UseBasicParsing
```

**Expected Response**:
```
StatusCode        : 200
StatusDescription : OK
RawContent        : HTTP/1.1 200 OK
```

### Step 3: Reload Mobile App in Expo Go

**On your phone in Expo Go:**
1. Go to **Ceres Liner** app
2. Press and hold, then select **Reload app** (or press `r` twice if using web)
3. App will refresh with new API URL

### Step 4: Test Signup

**In the app:**

1. **Click "CREATE ACCOUNT"**

2. **Fill in form:**
   - First Name: `John`
   - Last Name: `Doe`  
   - Email: `john.doe@ceres.com`
   - Phone: `09123456789`
   - Location: `Route 1`
   - Password: `password123`
   - Check "I agree to Terms"

3. **Click "SIGN UP"**

### Step 5: What to Look For

**✅ Success:**
- See alert: "Signup successful! Please login with your credentials"
- Button shows loading spinner briefly
- Returns to Login screen

**❌ Error Messages (with fixes):**

| Error | Cause | Fix |
|-------|-------|-----|
| "Network Error" | Backend not running | `npm start` in backend folder |
| "Network Error" | Wrong IP address | Make sure phone is on same WiFi. Test with `Invoke-WebRequest` |
| "All fields are required" | Missing field | Fill all fields including password |
| "Valid email is required" | Bad email format | Use format: `name@domain.com` |
| "Valid phone number required" | Phone < 10 digits | Use 10+ digit number |
| "Password must be 6+ chars" | Password too short | Use at least 6 characters |
| "Email already registered" | Email used before | Use a new email address |
| "Passwords do not match" | Confirm password wrong | Ensure both password fields match |

### Step 6: Check Debug Output

**To see detailed error messages:**

1. **In Expo Go app:**
   - Shake phone → Select "View logs"
   - Or press `j` in terminal where Expo Go is running

2. **Look for:**
   - API URL being used: Should show `http://192.168.1.11:3000`
   - Network errors: Shows actual error message
   - Response from backend: Should show `{"success": true, ...}`

---

## 🔧 If Signup Still Fails

### Test 1: Verify Network Connection

```powershell
# On computer, test if phone can reach backend
ping 192.168.1.11

# On phone, try accessing backend browser
# Open: http://192.168.1.11:3000/health
# Should show: {"status":"OK","timestamp":"..."}
```

### Test 2: Check Firewall

Windows Firewall might block the connection:

```powershell
# Allow Node.js through firewall
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe"

# Or disable Windows Defender Firewall temporarily (not recommended for production)
netsh advfirewall set allprofiles state off
```

### Test 3: Verify IP Address is Correct

```powershell
# Get all network adaptors
ipconfig

# Look for "Wi-Fi" adapter IPv4 Address
# Should show 192.168.1.x (or similar)
```

**If different from 192.168.1.11:**
1. Update `mobile/config/apiConfig.js` with correct IP
2. Reload app in Expo Go
3. Test signup again

### Test 4: Check Backend Logs

**In the PowerShell window where backend is running**, you should see:

```
POST /conductors/signup
Connected to the SQLite database.
Conductors table initialized.
```

If you see **errors** here, backend isn't processing requests properly.

---

## 📝 API Flow (Behind the Scenes)

When you click "SIGN UP", this happens:

```
Expo App (192.168.1.X)
    ↓ POST http://192.168.1.11:3000/conductors/signup
Backend Server (192.168.1.11:3000)
    ↓ Saves to SQLite database
Backend Response
    ↓ Success or Error message
Expo App
    ↓ Shows alert with result
```

Any step failing will show an error. The IP address must be correct at step 1.

---

## ✅ Quick Checklist

- [ ] Backend running: `npm start` in backend folder
- [ ] Backend responds to health check: `Invoke-WebRequest http://192.168.1.11:3000/health`
- [ ] API config updated: `mobile/config/apiConfig.js` has `192.168.1.11`
- [ ] App reloaded in Expo Go
- [ ] Phone on SAME WiFi as computer
- [ ] All form fields filled correctly
- [ ] No firewall blocking port 3000

---

## 🚨 Common Issues & Fixes

### Issue: "Failed to fetch" or Network timeout

**Most likely cause**: Phone is on different WiFi or wrong IP

**Fix**:
```powershell
# Check your IP again
ipconfig

# Update mobile/config/apiConfig.js with correct IP
# Example if Wi-Fi shows 192.168.1.15:
# BASE_URL: 'http://192.168.1.15:3000'

# Reload app in Expo Go
```

### Issue: Backend shows error "Port 3000 already in use"

**Fix**:
```powershell
# Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Restart backend
cd backend && npm start
```

### Issue: SQLite database error

**Fix**:
```powershell
# Delete database and restart backend
Remove-Item backend/tickets.db -Force
cd backend && npm start
```

---

## 📱 After Successful Signup

1. You should be back at **Login Screen**
2. Enter your full name: **`John Doe`** (exactly as signed up)
3. Click **LOGIN**
4. Should see: **"Welcome back, John!"**
5. Navigate to **Home Screen** ✅

If you reach Home Screen, everything is working!

---

## 💡 Tips for Smooth Testing

1. **Use same email format each test**: `john.doe+test@ceres.com` (changing +test each time)
2. **Check phone battery**: Low battery might affect connection
3. **Restart phone WiFi**: Sometimes WiFi gets stuck
4. **Clear Expo cache**: Sometimes old data interferes
   ```
   # On phone: Expo App → Settings → Clear cache
   ```
5. **Check logs**: Always check Expo logs when testing

---

## 🆘 Still Getting Errors?

Share these details:
1. **Exact error message** from the app alert
2. **Backend terminal output** (what it shows)
3. **Phone WiFi network name** (does it match computer WiFi?)
4. **Result from health check test**: 
   ```powershell
   Invoke-WebRequest -Uri "http://192.168.1.11:3000/health" -UseBasicParsing
   ```
5. **Mobile console logs** (shake phone → View logs)

With these details, we can debug quickly!
