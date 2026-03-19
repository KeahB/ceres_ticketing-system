# Credentials-Based Login Guide

## ✅ What Changed

### Before (Old Login)
- ❌ Login by conductor name only
- ❌ No password verification
- ❌ No real authentication

### After (New Login) ✅
- ✅ Login with **Email** + **Password**
- ✅ Real credentials verification
- ✅ Secure authentication flow
- ✅ Account status checking
- ✅ Show/hide password toggle

---

## 🔄 Complete User Flow

### Step 1: Signup

1. Open Ceres Liner app in Expo Go
2. Click **"CREATE ACCOUNT"**
3. Fill in:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john.doe@ceres.com` ← **IMPORTANT: This is your login email**
   - Phone: `09123456789`
   - Location: `Route 1`
   - Password: `password123` ← **IMPORTANT: Save this password**
   - Check "I agree to Terms"
4. Click **"SIGN UP"**
5. ✅ See: "Signup successful! Please login with your credentials"

### Step 2: Back to Login Screen

- You're automatically returned to **Login Screen**

### Step 3: Login with Credentials

**Now use your email + password:**

1. Enter Email: `john.doe@ceres.com` (the one you signed up with)
2. Enter Password: `password123` (the one you created)
3. Click **"LOGIN"**
4. ✅ See: "Welcome back, John!"
5. ✅ Logged in! → Home Screen

---

## 🔐 Login Security Features

### 1. **Email Verification**
- Must match exactly (case-insensitive)
- Must be a valid email format
- Must be registered in database

### 2. **Password Verification**
- Checks against password stored in database
- Must be at least 6 characters
- Case-sensitive

### 3. **Account Status Checking**
- Verifies conductor status is `active`
- If `inactive`: Shows "Your account has been deactivated. Contact support."

### 4. **Show/Hide Password**
- Eye icon to toggle password visibility
- See what you're typing before login

---

## 📋 Login Screen Fields

### Email Field
- **Type**: Email input
- **Icon**: Mail icon
- **Placeholder**: "Enter your email"
- **Format**: Must contain `@` symbol
- **Example**: `john.doe@ceres.com`

### Password Field
- **Type**: Secure password input
- **Icon**: Lock icon
- **Placeholder**: "Enter your password"
- **Min Length**: 6 characters
- **Toggle**: Eye icon to show/hide

### Password Visibility Toggle
- **Icon**: Eye (visible) / Eye-off (hidden)
- **Function**: Click to show/hide password
- **Disabled**: During login process

---

## ✅ Testing Complete Flow

### Test Case 1: Valid Credentials
```
Signup:
- Email: test@ceres.com
- Password: password123

Login:
- Email: test@ceres.com
- Password: password123

Result: ✅ Login successful!
```

### Test Case 2: Wrong Password
```
Signup:
- Email: john@ceres.com
- Password: password123

Attempt Login:
- Email: john@ceres.com
- Password: wrongpassword

Result: ❌ "Invalid password. Please try again."
```

### Test Case 3: Email Not Found
```
Attempt Login:
- Email: notregistered@ceres.com
- Password: password123

Result: ❌ "Email not found. Please sign up first."
```

### Test Case 4: Empty Fields
```
Attempt Login:
- Email: (empty)
- Password: password123

Result: ❌ "Please enter your email"
```

---

## 🛠️ Backend API Changes

### Old Endpoint
```
POST /conductors/login
Body: { firstName, lastName }
```

### New Endpoint ✅
```
POST /conductors/login
Body: { email, password }
```

### Success Response
```json
{
  "success": true,
  "message": "Login successful",
  "conductor": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@ceres.com",
    "phone": "09123456789",
    "location": "Route 1",
    "status": "active"
  }
}
```

### Error Response Examples
```json
// Invalid password
{
  "success": false,
  "message": "Invalid password. Please try again."
}

// Email not found
{
  "success": false,
  "message": "Email not found. Please sign up first."
}

// Account deactivated
{
  "success": false,
  "message": "Your account has been deactivated. Contact support."
}
```

---

## 💾 Session Storage

After successful login, conductor info is stored in AsyncStorage:

```javascript
{
  id: 1,
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@ceres.com",
  phone: "09123456789",
  location: "Route 1",
  status: "active",
  loginTime: "2026-03-19T04:22:38.360Z"
}
```

This session persists until:
- User logs out
- App is uninstalled
- AsyncStorage is cleared

---

## 🚨 Common Login Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Please enter your email" | Email field empty | Type your email address |
| "Please enter a valid email address" | Missing `@` symbol | Use format: `email@domain.com` |
| "Please enter your password" | Password field empty | Type your password |
| "Password must be at least 6 characters" | Password too short | Use 6+ character password |
| "Email not found. Please sign up first." | Email not registered | Sign up with this email first |
| "Invalid password. Please try again." | Wrong password | Check password carefully (case-sensitive) |
| "Your account has been deactivated..." | Account inactive | Contact admin support |
| "Database error" | Backend problem | Check backend server is running |

---

## 🎯 Key Points to Remember

✅ **Email Format**
- Use the email you signed up with
- Email is case-insensitive for login
- Must contain `@` symbol

✅ **Password**
- Must match exactly (case-sensitive)
- At least 6 characters
- Keep it safe!

✅ **First Login**
- After signup, you're on the Login screen
- Don't need to reopen app
- Can login immediately with credentials

✅ **Session Persistence**
- Once logged in, session saved on device
- You'll go straight to Home screen on app restart
- No need to login again unless you logout

---

## 🔒 Production Security Notes

Current implementation stores passwords in plain text. For production:

```javascript
// TODO: Implement these security measures
1. Hash passwords with bcrypt before storing
2. Add JWT token-based authentication
3. Add email verification on signup
4. Add password reset functionality
5. Add login attempt rate limiting
6. Add session timeout (auto-logout after inactivity)
7. Use HTTPS for all API calls
8. Add account lockout after failed attempts
```

See [IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md) for production checklist.

---

## 📱 UI/UX Improvements

### Login Screen Features
- **Credential inputs**: Email and Password fields
- **Password toggle**: Eye icon to show/hide password
- **Icons**: Mail, Lock for visual clarity
- **Loading state**: Spinner during login
- **Error alerts**: Clear, specific error messages
- **Field validation**: Real-time input validation
- **Disabled state**: Fields disabled during login
- **Yellow branding**: Primary color is yellow (Ceres Liner)

### Signup → Login Flow
- Smooth transition from signup to login
- Auto-return to login from signup
- Pre-filled email in some cases
- Professional alert messages

---

## 🧪 Quick Testing Steps

1. **Start backend** (if not running):
   ```bash
   cd backend && npm start
   ```

2. **Reload mobile app** in Expo Go:
   - Shake phone → Select "Reload"

3. **Sign up** with test data:
   - Email: `test@ceres.com`
   - Password: `test123`

4. **Return to login** (automatic)

5. **Login** with same credentials:
   - Email: `test@ceres.com`
   - Password: `test123`

6. ✅ **Should see home screen!**

---

## 📞 Troubleshooting

**Still having issues?**

1. Check backend is running: `http://192.168.1.11:3000/health`
2. Verify exact email and password from signup
3. Check mobile console logs (Expo Go → View logs)
4. Clear app cache and reload
5. Try signing up with different email

**For detailed help**, check **[EXPO_GO_GUIDE.md](../EXPO_GO_GUIDE.md)** for Expo Go on real devices.
