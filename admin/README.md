# Ceres Liner Admin Dashboard (Web)

A professional web-based admin dashboard for managing the Ceres Liner ticketing system. Built with React, this application allows administrators to manage conductors, view system statistics, and monitor operations.

## Features

- 🔐 **Secure Admin Login** - Password-protected access
- 📊 **Dashboard Statistics** - Real-time metrics and KPIs
- 👥 **Conductor Management** - View, search, edit, and delete conductors
- 🔍 **Search Functionality** - Filter conductors by name or email
- 📈 **Revenue Tracking** - Monitor ticket sales and revenue
- 🎯 **Status Management** - Approve, activate, or deactivate conductors
- 📱 **Responsive Design** - Works on desktop and tablet devices

## Architecture

```
admin/
├── public/
│   └── index.html
├── src/
│   ├── pages/
│   │   ├── AdminLogin.js     # Login page
│   │   └── Dashboard.js      # Main dashboard
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

## Installation & Setup

### Prerequisites
- Node.js 14+ installed
- Backend server running on `http://192.168.1.100:3000`

### Installation Steps

1. **Navigate to admin directory:**
```bash
cd admin
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm start
```

The app will open at `http://localhost:3000`

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Usage

### Login
1. Navigate to the admin dashboard
2. Enter the admin password: `CERES2024`
3. Click "ACCESS DASHBOARD"

### Dashboard Features

#### Key Metrics
- **Total Conductors** - Number of registered conductors
- **Active Tickets** - Currently active/pending tickets
- **Revenue Generated** - Total revenue from completed tickets
- **Completed Routes** - Number of finished routes

#### Conductor Management
- **View All** - See all registered conductors
- **Search** - Filter by first name, last name, or email
- **Edit** - Modify conductor details (all except email)
- **Change Status** - Set conductor status (pending/active/inactive)
- **Delete** - Remove conductor records (with confirmation)

## API Integration

The dashboard communicates with the backend via these endpoints:

### GET /admin/stats
Returns dashboard statistics
```json
{
  "totalConductors": 15,
  "activeTickets": 42,
  "revenue": 5250,
  "completedRoutes": 8
}
```

### GET /admin/conductors
Returns list of all conductors
```json
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+63 9XX XXXX XXXX",
    "location": "Dumaguete - Sibulan",
    "status": "active",
    "createdAt": "2024-03-19T10:30:00Z"
  }
]
```

### GET /admin/conductors/:id
Returns individual conductor details

### PUT /admin/conductors/:id
Updates conductor information
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+63 9XX XXXX XXXX",
  "location": "Dumaguete - Sibulan",
  "status": "active"
}
```

### DELETE /admin/conductors/:id
Deletes a conductor record

## Design System

### Ceres Liner Colors
- **Primary Red**: `#DC143C` - Main brand color
- **Dark Background**: `#121212` - Main background
- **Surface**: `#1E1E1E` - Component backgrounds
- **Accent Gold**: `#FFD700` - Highlights and accents

### Typography
- **Headers**: 28px, 24px, 18px
- **Body**: 16px, 14px (regular and medium weights)
- **Small text**: 12px, 11px

### Components
- Professional buttons with hover effects
- Clean forms with validation feedback
- Responsive table layouts
- Modal dialogs for editing
- Status badges for quick visual feedback
- Search bars with clear functionality
- Alert messages for user feedback

## Configuration

### Update Backend URL
Edit the `API_BASE` constant in `src/pages/Dashboard.js`:

```javascript
const API_BASE = 'http://192.168.1.100:3000';
```

### Change Admin Password
Edit the `ADMIN_PASSWORD` constant in `src/pages/AdminLogin.js`:

```javascript
const ADMIN_PASSWORD = 'CERES2024';
```

### Update Default Refresh Interval
Edit the `setInterval` in `src/pages/Dashboard.js`:

```javascript
const interval = setInterval(loadDashboardData, 30000); // 30 seconds
```

## Security Notes

### For Development
- Admin password is hardcoded (change before production)
- No HTTPS enforcement
- Uses localStorage for simple authentication token

### For Production
1. **Implement JWT Authentication**
   - Generate secure tokens on login
   - Validate tokens on each request

2. **Password Security**
   - Change default admin password
   - Implement password hashing on backend
   - Add password reset functionality

3. **HTTPS**
   - Deploy with SSL/TLS certificates
   - Enable secure cookies

4. **API Security**
   - Implement rate limiting
   - Add input validation on all requests
   - Sanitize data before display

5. **Session Management**
   - Implement session expiration
   - Add logout timeout
   - Refresh tokens periodically

## Troubleshooting

### Connection Issues
- Verify backend server is running on `http://192.168.1.100:3000`
- Check network connectivity
- Clear browser cache if needed

### Login Not Working
- Verify admin password is correct: `CERES2024`
- Check browser console for error messages
- Ensure localStorage is enabled

### Dashboard Data Not Loading
- Check backend API endpoints are accessible
- Verify CORS is enabled on backend
- Check browser console for network errors
- Ensure database has data

### Slow Performance
- Increase refresh interval to reduce API calls
- Optimize backend queries
- Clear browser cache
- Check network connection speed

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## File Structure

```
admin/
├── public/
│   ├── index.html              # HTML template
│   └── favicon.ico            # Browser tab icon
├── src/
│   ├── pages/
│   │   ├── AdminLogin.js       # Login page component
│   │   └── Dashboard.js        # Main dashboard component
│   ├── styles/
│   │   ├── AdminLogin.css      # Login styles
│   │   └── Dashboard.css       # Dashboard styles
│   ├── App.js                  # Main app component with routing
│   ├── App.css                 # Global styles and design system
│   ├── index.js                # React entry point
│   └── index.css               # Global CSS
├── package.json                # Dependencies and scripts
├── .gitignore                  # Git ignore file
└── README.md                   # This file
```

## Environment Variables

For future use with `.env` file:

```
REACT_APP_API_BASE=http://192.168.1.100:3000
REACT_APP_ADMIN_PASSWORD=CERES2024
```

## Future Enhancements

- [ ] Advanced reporting and analytics
- [ ] Ticket management interface
- [ ] Route tracking and optimization
- [ ] Real-time notifications
- [ ] Bulk conductor import/export
- [ ] Attendance tracking
- [ ] Payment processing integration
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Email notifications

## Support

For issues or questions:
1. Check this README
2. Review code comments
3. Check browser console for errors
4. Verify backend connectivity
5. Check API response data

## Version

- **Version**: 1.0.0
- **Last Updated**: March 19, 2026
- **Ceres Liner Ticketing System**

---

**Built with React • Powered by Ceres Liner**
