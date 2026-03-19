# Ceres Liner System - Implementation Guide

## Overview of System Architecture

The Ceres Liner Ticketing System is now organized as:

1. **Mobile App (Conductors Only)** - React Native with Expo
   - Conductor login and signup
   - Ticket generation and management
   - Ticket history tracking
   - SQLite local storage

2. **Web Admin Dashboard** - React web application
   - Administrator interface
   - Conductor management
   - System statistics and analytics
   - Dashboard access only

3. **Backend Server** - Node.js Express API
   - RESTful API endpoints
   - SQLite database
   - Business logic and validation
   - CORS support

---

## Installation & Setup

### 1. Backend Server Setup

```bash
cd backend
npm install
npm start
```
*The server will run on `http://localhost:3000`.*

### 2. Mobile App Setup (Conductors)

```bash
cd mobile
npm install
npm start
```

Then choose:
- Press `a` for Android Emulator
- Press `i` for iOS Simulator
- Press `w` for Web preview

### 3. Web Admin Dashboard Setup

```bash
cd admin
npm install
npm start
```

The admin dashboard will open at `http://localhost:3000` (or next available port).

---

## Features Documentation

### A. Mobile App - Conductor Features

**Location**: `mobile/`

**Features**:
- **Conductor Signup**: Self-registration with validation
- **Conductor Login**: Name-based login (no admin access on mobile)
- **Ticket Generation**: Create and manage tickets
- **Ticket History**: View past transactions
- **Ticket Preview**: See ticket details before submission
- **Local Storage**: SQLite database for offline capability

**Navigation Screens**:
- Login → Home → Generator → Preview → History

---

### B. Web Admin Dashboard - Administrator Features

**Location**: `admin/`

**Features**:

#### 1. Admin Login
- Password-protected access
- Default password: `CERES2024` (change in production)
- Secure session management

#### 2. Dashboard Statistics
- Total Conductors count
- Active Tickets count
- Revenue Generated (sum from completed tickets)
- Completed Routes count
- Real-time data with auto-refresh every 30 seconds

#### 3. Conductor Management
- **View All Conductors** - List with pagination
- **Search Functionality** - Filter by name or email
- **Edit Conductor** - Modal dialog for updating details
- **Change Status** - Set conductor status (pending/active/inactive)
- **Delete Conductor** - Remove with confirmation
- **View Details** - All conductor information

#### 4. Admin Actions
- Monitor system performance
- Approve new conductor registrations
- Deactivate problematic conductors
- Delete inactive accounts
- Track revenue and metrics

**Backend Integration**:
- GET `/admin/stats` - Dashboard statistics
- GET `/admin/conductors` - All conductors list
- GET `/admin/conductors/:id` - Individual details
- PUT `/admin/conductors/:id` - Update conductor
- DELETE `/admin/conductors/:id` - Delete conductor

---

### C. Design System (Ceres Liner Branding)

**Mobile Theme**: `mobile/theme/ceresTheme.js`
**Web Styles**: `admin/src/App.css`

**Design Components**:

#### Color Scheme
- **Primary**: Ceres Red (#DC143C) - Main brand color
- **Secondary**: Gold (#FFD700) - Accent color
- **Dark Background**: #121212 - Main app background
- **Surface Colors**: Various grays for card and component backgrounds

#### Typography
- Consistent font sizes and weights
- Clear hierarchy from headers to captions
- Professional letterspacing for emphasis

#### Components
- Unified button styles
- Consistent card designs
- Status badges with color coding
- Search bars with filtering
- Modal dialogs for editing

---

## Backend API Routes

### Conductor Routes
```
POST /conductors/signup
  Body: {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    location: string,
    password: string
  }
  Response: { success: boolean, conductorId: number }
```

### Admin Routes
```
GET /admin/stats
  Response: {
    totalConductors: number,
    activeTickets: number,
    revenue: number,
    completedRoutes: number
  }

GET /admin/conductors
  Response: Array of conductor objects

GET /admin/conductors/:id
  Response: Individual conductor object

PUT /admin/conductors/:id
  Body: { firstName, lastName, phone, location, status }
  Response: { success: boolean, message: string }

DELETE /admin/conductors/:id
  Response: { success: boolean, message: string }
```

---

## Navigation & Flow

### Mobile App Flow
```
Login Screen 
  ├─ Enter conductor name
  ├─ Or navigate to Signup
  └─ → Home Screen
      ├─ Generate Ticket → Preview → History
      ├─ View Current Time
      ├─ Sync Data
      └─ Logout
```

### Web Admin Dashboard Flow
```
Admin Login (/login)
  ├─ Enter admin password: CERES2024
  └─ → Dashboard (/dashboard)
      ├─ View Statistics
      ├─ Search Conductors
      ├─ Edit Conductor (Modal)
      ├─ Delete Conductor
      └─ Logout
```

---

## File Structure

### Mobile App
```
mobile/
├── theme/
│   └── ceresTheme.js           # Design system
├── screens/
│   ├── LoginScreen.js          # Conductor login
│   ├── SignupScreen.js         # Conductor registration
│   ├── HomeScreen.js
│   ├── GeneratorScreen.js
│   ├── PreviewScreen.js
│   └── HistoryScreen.js
├── services/
│   ├── authService.js
│   ├── ticketService.js
│   └── syncService.js
├── navigation/
│   └── AppNavigator.js
└── package.json
```

### Web Admin Dashboard
```
admin/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── AdminLogin.js
│   │   └── Dashboard.js
│   ├── styles/
│   │   ├── AdminLogin.css
│   │   └── Dashboard.css
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

### Backend Server
```
backend/
├── routes/
│   ├── ticketRoutes.js
│   ├── reportRoutes.js
│   ├── conductorRoutes.js     # Signup endpoint
│   └── adminRoutes.js         # Admin panel API
├── controllers/
│   ├── ticketController.js
│   └── reportController.js
├── database/
│   └── sqlite.js              # Conductors table added
├── middleware/
│   └── errorHandler.js
├── app.js
├── server.js
└── package.json
```

---

## Security Considerations

### Authentication
- Mobile: Local name-based login (session in AsyncStorage)
- Admin: Password-based login (localStorage token)
- Backend: Basic validation on endpoints

### Password Management
- Admin password: `CERES2024` (should be changed in production)
- Conductor passwords stored in database (should be hashed in production)

### Database
- Email validation for uniqueness
- Input validation on all endpoints
- CORS enabled for frontend communication

### Recommendations for Production

1. **Implement JWT Authentication**
   - Generate tokens on login
   - Validate on each protected request
   - Token refresh mechanism

2. **Hash Passwords**
   - Use bcrypt for password hashing
   - Never store plaintext passwords

3. **Change Default Credentials**
   - Change admin password
   - Remove hardcoded credentials

4. **Add Rate Limiting**
   - Prevent brute force attacks
   - Limit signup attempts

5. **Enable HTTPS**
   - Use SSL/TLS certificates
   - Enforce secure connections

6. **Implement Logging**
   - Log all admin actions
   - Track changes and deletions
   - Monitor API access

---

## Testing the System

### Test Conductor Signup (Mobile)
1. Open mobile app
2. Click "CREATE ACCOUNT"
3. Fill signup form
4. Submit
5. Should redirect to login
6. Login with registered credentials

### Test Admin Dashboard (Web)
1. Open web admin dashboard
2. Enter password: `CERES2024`
3. View statistics
4. Search and manage conductors
5. Edit conductor details
6. Delete conductor (with confirmation)

### Test API Endpoints
```bash
# Get stats
curl http://192.168.1.100:3000/admin/stats

# Get all conductors
curl http://192.168.1.100:3000/admin/conductors

# Get single conductor
curl http://192.168.1.100:3000/admin/conductors/1
```

---

## Troubleshooting

### Mobile App Issues
- **AsyncStorage error**: Run `npm install` in mobile directory
- **Connection error**: Update API URL in SignupScreen.js
- **Navigation issues**: Clear app cache and reinstall

### Admin Dashboard Issues
- **Can't login**: Verify admin password is `CERES2024`
- **No data loading**: Check backend server is running
- **CORS errors**: Verify CORS enabled in Express app

### Backend Issues
- **Database errors**: Check database file permissions
- **Connection refused**: Verify port 3000 is available
- **Module not found**: Run `npm install` in backend directory

---

## Next Steps & Future Enhancements

1. **Authentication**: JWT implementation
2. **Email Verification**: Conductor account confirmation
3. **Admin Approval**: Workflow for new conductors
4. **Advanced Reports**: Analytics and trends
5. **Notifications**: Push/email notifications
6. **Mobile Admin App**: Separate mobile admin app
7. **Real-time Sync**: WebSocket for live updates
8. **Multi-language**: Internationalization support

---

## Version Information
- **Version**: 1.0.0
- **Last Updated**: March 19, 2026
- **Ceres Liner Ticketing System**
- **Dumaguete City**
