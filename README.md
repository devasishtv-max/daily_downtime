# Downtime Tracker

A comprehensive web application for tracking daily downtime entries by teams and generating detailed reports. Built with React frontend and Node.js/Express backend with SQLite database.

## Features

### 🔐 Authentication & User Management
- Secure login system with JWT tokens
- Role-based access control (Admin/User)
- User management for administrators
- Team-based user organization

### 📊 Downtime Recording
- Record scheduled and unscheduled downtime
- Support for multiple banking/payment channels
- Automatic duration calculation
- Detailed reason tracking
- User attribution for all records

### 📈 Reporting & Analytics
- Summary reports similar to the provided image format
- Detailed downtime records view
- Date range filtering
- Last 24 hours tracking
- Cumulative downtime calculations

### 🎯 Pre-configured Channels
The application comes with 11 pre-configured banking/payment channels:
- ATM Switch
- Credit Card Switch
- UPI Switch
- IMPS
- Mobile Banking
- Internet Banking
- BBPS
- IOB-Pay
- AePS
- Fastag
- RTGS/NEFT

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Start the backend server:**
   ```bash
   npm run server
   ```
   The server will start on `http://localhost:5000`

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   The application will open on `http://localhost:3000`

### Default Login Credentials
- **Username:** admin
- **Password:** admin123

## Usage

### For Administrators
1. **Login** with admin credentials
2. **Manage Users** - Create new team members and assign roles
3. **View Reports** - Access comprehensive downtime analytics
4. **Record Downtime** - Add downtime entries for any channel

### For Team Members
1. **Login** with your team credentials
2. **Record Downtime** - Add new downtime entries for your channels
3. **View Reports** - Access downtime reports and analytics
4. **Dashboard** - View recent activity and quick statistics

## API Endpoints

### Authentication
- `POST /api/login` - User login

### Downtime Management
- `GET /api/channels` - Get all channels
- `POST /api/downtime` - Add downtime record
- `GET /api/downtime` - Get detailed downtime records
- `GET /api/downtime/report` - Get summary report data

### User Management (Admin Only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `password` - Hashed password
- `team_name` - Team identifier
- `role` - User role (admin/user)
- `created_at` - Account creation timestamp

### Channels Table
- `id` - Primary key
- `name` - Channel name
- `description` - Channel description

### Downtime Records Table
- `id` - Primary key
- `channel_id` - Foreign key to channels
- `user_id` - Foreign key to users
- `downtime_type` - Scheduled/Unscheduled
- `start_time` - Downtime start timestamp
- `end_time` - Downtime end timestamp
- `duration_minutes` - Calculated duration
- `reason` - Downtime reason
- `created_at` - Record creation timestamp

## Report Format

The application generates reports in the same format as your reference image:

| Sr. | Channel | Scheduled (mins) | Unscheduled (mins) | Last 24h (mins) | From | To | Type | Reason |
|-----|---------|------------------|-------------------|-----------------|------|----|------|--------|
| 1   | ATM Switch | 139 | 10 | Nil | Nil | Nil | Nil | Nil |

## Security Features

- **Password Hashing** - All passwords are hashed using bcrypt
- **JWT Authentication** - Secure token-based authentication
- **Role-based Access** - Different permissions for admins and users
- **Input Validation** - Server-side validation for all inputs
- **SQL Injection Protection** - Parameterized queries

## Customization

### Adding New Channels
Channels can be added directly to the database or through the API. The default channels are inserted automatically on first run.

### Modifying Report Formats
The report generation logic is in `server/index.js` and can be customized to match specific requirements.

### Styling
The application uses custom CSS with a clean, modern design. Styles can be modified in `src/index.css` and `src/App.css`.

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - Secret key for JWT tokens

### Database
The application uses SQLite for simplicity. For production, consider migrating to PostgreSQL or MySQL.

## Support

For issues or questions:
1. Check the console for error messages
2. Verify database permissions
3. Ensure all dependencies are installed
4. Check network connectivity between frontend and backend

## License

This project is open source and available under the MIT License.
