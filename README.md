# Meeting Room Booker

A modern, production-ready meeting room booking management system built with React, TypeScript, Node.js, and Prisma.

**Made by Sufi Hassan Asim**

## Features

### User Features
- 📅 **Interactive Calendar** - View and book meeting rooms with an intuitive calendar interface
- 🎨 **Modern UI** - Beautiful red/white/charcoal theme with dark mode support
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 🔄 **Real-time Updates** - Socket.IO integration for live booking updates
- ✅ **Smart Validation** - Prevents double bookings and validates capacity
- 🌓 **Dark Mode** - Toggle between light and dark themes

### Admin Features
- 🔐 **Secure Authentication** - JWT-based admin login with database-stored credentials
- 🏢 **Room Management** - Create, update, and delete meeting rooms
- 📊 **Dashboard** - View all bookings in calendar and table formats
- ⏱️ **Meeting Control** - End meetings early when needed
- 🎨 **Color Coding** - Assign custom colors to rooms for easy identification
- 📈 **Booking Analytics** - Track room usage and booking status

### Technical Features
- ⚡ **Real-time Scheduling** - Automatic status updates (CONFIRMED → IN_PROGRESS → ENDED)
- 🔒 **Protected Routes** - Admin panel requires authentication
- 🗄️ **Database Integration** - SQLite for easy local development
- 🚀 **Production Ready** - Proper error handling, validation, and security
- 🎯 **Edge Case Handling** - Prevents overlaps, validates times, checks capacity

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Ant Design** for UI components
- **FullCalendar** for calendar views
- **Socket.IO Client** for real-time updates
- **Tailwind CSS** for styling
- **Vite** for build tooling

### Backend
- **Node.js** with Express
- **Prisma ORM** with SQLite
- **Socket.IO** for WebSocket communication
- **JWT** for authentication
- **bcrypt** for password hashing

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install frontend dependencies:**
```bash
npm install
```

2. **Install backend dependencies:**
```bash
cd server
npm install
```

3. **Setup database:**
```bash
cd server
npx prisma db push
npx ts-node seed.ts
```

### Running the Application

You need to run both servers:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Access the Application

- **User Interface**: http://localhost:8080
- **Admin Panel**: http://localhost:8080/admin
- **Admin Login**: 
  - Email: `admin@dplit.com`
  - Password: `123456789`

## Deployment

### Backend (Render + GitHub Actions)
1. Create a Render Web Service that points to the `server/` directory (build command: `npm install && npm run build`, start command: `npm run start`) and configure its environment variables (`DATABASE_URL`, JWT secrets, etc.).
2. Copy the service’s **Deploy Hook** URL from Render.
3. In GitHub, add a repository secret named `RENDER_DEPLOY_HOOK_URL` with that hook URL.
4. Push changes to `main` (or use the “Run workflow” button) and the workflow in `.github/workflows/deploy-server.yml` will:
   - install server dependencies,
   - run Prisma generate,
   - build the server, and
   - call the Render deploy hook to release a new version.

## Project Structure

```
room-booker-dpl/
├── src/                      # Frontend source
│   ├── components/          # React components
│   ├── pages/              # Page components
│   └── index.css           # Global styles
├── server/                  # Backend source
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── index.ts        # Server entry
│   │   ├── scheduler.ts    # Meeting scheduler
│   │   └── socket.ts       # WebSocket setup
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── seed.ts             # Database seeder
└── public/                  # Static assets
    ├── logo.png            # Rebel logo
    └── banner.png          # Banner image
```

## API Endpoints

### Public Endpoints
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get bookings (with filters)
- `GET /api/admin/rooms` - Get all rooms

### Admin Endpoints (Requires Authentication)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/rooms` - Create room
- `PUT /api/admin/rooms/:id` - Update room
- `DELETE /api/admin/rooms/:id` - Delete room
- `GET /api/admin/bookings` - Get all bookings
- `PUT /api/admin/bookings/:id/end` - End meeting early

## Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected admin routes
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CORS configuration
- ✅ Error handling and logging

## Edge Cases Handled

1. **Double Booking Prevention** - Checks for overlapping bookings
2. **Capacity Validation** - Ensures attendees don't exceed room capacity
3. **Time Validation** - End time must be after start time
4. **Room Deletion** - Prevents deletion of rooms with future bookings
5. **Token Expiry** - JWT tokens expire after 8 hours
6. **Real-time Sync** - Socket.IO ensures all clients see updates
7. **Timezone Handling** - All times stored in ISO format
8. **Responsive Design** - Works on all device sizes

## Future Enhancements

- Email notifications for bookings
- Recurring meetings support
- Room amenities and features
- User profiles and booking history
- Calendar export (iCal)
- Multi-language support
- Advanced analytics dashboard

## License

This project is created by Sufi Hassan Asim.

## Support

For issues or questions, please contact the development team.
