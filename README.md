# Attendance Management System

A professional attendance management system built with React frontend and Django backend.

## Features

### Employee Portal
- Dashboard with real-time clock and attendance status
- Clock in/out functionality
- Attendance history tracking
- Leave management with calendar view
- Profile management with password change

### Admin Portal
- Employee management (create, view employees)
- Leave approval system
- Attendance reports with CSV export
- Dashboard with quick actions

## Tech Stack

**Frontend:**
- React 18
- React Router DOM
- Axios for API calls
- React Hot Toast for notifications

**Backend:**
- Django 5.2
- Django REST Framework
- JWT Authentication
- SQLite Database
- CORS Headers

## Setup Instructions

### Backend Setup
1. Navigate to attendance_backend directory
2. Install dependencies: `pip install -r requirements.txt`
3. Run migrations: `python manage.py migrate`
4. Create superuser: `python manage.py createsuperuser`
5. Start server: `python manage.py runserver`

### Frontend Setup
1. Navigate to attendance-frontend directory
2. Install dependencies: `npm install`
3. Start development server: `npm start`

## Login Credentials

To access the system, you'll need to create user accounts through the Django admin interface or by using the admin panel's employee management feature.

**Initial Setup:**
1. Create a superuser account using: `python manage.py createsuperuser`
2. Use the admin interface to create additional users with appropriate roles
3. Employees can be created through the admin portal's employee management section

## Project Structure

```
attendance_system/
├── attendance_backend/          # Django backend
│   ├── accounts/               # User management
│   ├── attendance/             # Attendance tracking
│   └── attendance_system/      # Main settings
└── attendance-frontend/        # React frontend
    ├── src/
    │   ├── components/         # React components
    │   ├── context/           # Auth context
    │   └── services/          # API services
    └── public/
```

## API Endpoints

### Authentication
- POST `/api/auth/login/` - User login
- POST `/api/auth/change-password/` - Change password

### Attendance
- POST `/api/attendance/clock-in/` - Clock in
- POST `/api/attendance/clock-out/` - Clock out
- GET `/api/attendance/history/` - Get attendance history

### Admin
- POST `/api/auth/create-user/` - Create employee
- GET `/api/auth/users/` - Get all employees
- GET `/api/attendance/admin/report/` - Get attendance report

## License

MIT License