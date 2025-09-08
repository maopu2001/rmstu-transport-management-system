# RMSTU Bus Management System

A comprehensive bus management system built with Next.js, MongoDB, and real-time tracking capabilities.

## Features Implemented

### 🚌 **Real-Time Vehicle Tracking**

- ✅ Live GPS location tracking for buses
- ✅ Real-time status updates (On Schedule, Delayed, Breakdown, Offline)
- ✅ Interactive map with live bus positions
- ✅ WebSocket-style updates for real-time data sync

### 👨‍💼 **Admin Dashboard**

- ✅ Real-time dashboard with live statistics
- ✅ Vehicle management (add, edit, assign drivers)
- ✅ Route management with stop sequences
- ✅ Schedule management with recurring trips
- ✅ Requisition management and approval
- ✅ Analytics with peak hours and trip trends

### 🚍 **Driver Interface**

- ✅ My Schedule view with daily trips
- ✅ Trip control panel with GPS tracking
- ✅ Start/End trip functionality
- ✅ Real-time location broadcasting
- ✅ Status updates (On Schedule, Delayed, etc.)

### 🎓 **Student Features**

- ✅ Live bus tracking on interactive map
- ✅ Schedule viewing with real-time updates
- ✅ Bus requisition system for special trips
- ✅ Real-time bus locations and ETAs

### 🔐 **Authentication & Security**

- ✅ Role-based access control (Admin, Driver, Student)
- ✅ JWT-based authentication with NextAuth.js
- ✅ Password reset with email notifications
- ✅ Secure API endpoints with proper authorization

### 📧 **Email System**

- ✅ Password reset emails with templates
- ✅ Welcome emails for new users
- ✅ Configurable email service (Gmail, Outlook, Custom SMTP)
- ✅ Graceful fallback to console logging if email not configured

### 📊 **Database & APIs**

- ✅ MongoDB with Mongoose ODM
- ✅ RESTful API architecture
- ✅ Real-time data synchronization
- ✅ Geospatial indexing for location queries
- ✅ Comprehensive data models for all entities

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js with JWT
- **Maps**: React Leaflet with OpenStreetMap
- **Email**: Nodemailer with multiple provider support
- **Real-time**: Custom WebSocket-style implementation

## Quick Start

### 1. Prerequisites

```bash
- Node.js 18+
- MongoDB (local or cloud)
- pnpm (recommended) or npm
```

### 2. Installation

```bash
# Clone the repository
git clone <repository-url>
cd rmstu-bus-system

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local
```

### 3. Environment Configuration

Edit `.env.local` with your settings:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/rmstu-bus-system

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-jwt-secret-here

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 4. Database Setup

```bash
# Start MongoDB (if running locally)
mongod

# The application will automatically create collections on first run
```

### 5. Run the Application

```bash
# Development mode
pnpm dev

# Production build
pnpm build
pnpm start
```

Visit `http://localhost:3000` to access the application.

## Default Accounts

On first run, you can create admin accounts through the signup page. The first user registered will need to be manually promoted to admin role in the database.

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login (handled by NextAuth)
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Admin APIs

- `GET /api/vehicles` - List all vehicles
- `POST /api/vehicles` - Create new vehicle
- `GET /api/routes` - List all routes
- `POST /api/routes` - Create new route
- `GET /api/schedules` - List all schedules
- `POST /api/schedules` - Create new schedule
- `GET /api/analytics/dashboard` - Dashboard statistics

### Driver APIs

- `GET /api/trips/driver` - Get driver's daily schedule
- `POST /api/trips/[id]/start` - Start a trip
- `POST /api/trips/[id]/end` - End a trip
- `POST /api/trips/[id]/location` - Update vehicle location

### Student APIs

- `GET /api/vehicles/active` - Get active vehicles with locations
- `GET /api/vehicles/locations` - Get real-time vehicle locations
- `POST /api/requisitions` - Submit bus requisition

## Real-Time Features

### GPS Tracking

The system implements real-time GPS tracking using:

- Browser Geolocation API for accurate positioning
- Automatic location updates every 30 seconds
- Fallback mechanisms for GPS failures
- GeoJSON format for location storage

### Live Updates

- WebSocket-style context for real-time data sync
- Automatic refresh of vehicle locations every 10 seconds
- Real-time dashboard statistics
- Live trip status updates

## Mobile Responsiveness

The application is fully responsive and works on:

- Desktop browsers
- Tablet devices
- Mobile phones
- Progressive Web App (PWA) ready

## Security Features

- Input validation and sanitization
- SQL injection prevention with Mongoose
- XSS protection with proper data encoding
- CSRF protection with NextAuth.js
- Secure password hashing with bcrypt
- Role-based access control
- API rate limiting ready

## Production Deployment

### Environment Variables

Set these in your production environment:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/rmstu-bus
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your-email-password
```

### Deployment Platforms

- Vercel (recommended for Next.js)
- Railway
- DigitalOcean App Platform
- AWS Amplify
- Docker containers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues:

- Create an issue in the repository
- Check the documentation
- Review the API endpoints above

## Changelog

### v1.0.0 - Initial Release

- ✅ Complete removal of all mock/placeholder data
- ✅ Full implementation of real-time GPS tracking
- ✅ Comprehensive API endpoints for all features
- ✅ Email system with multiple provider support
- ✅ Real-time dashboard with live statistics
- ✅ Mobile-responsive design
- ✅ Production-ready security features
