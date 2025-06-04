# Authentication System with Email Verification

A full-stack authentication system built with React, Node.js, and MongoDB, featuring email verification, password reset, and role-based access control.
## Frontend
[Frontend by Rudra Shivakalyan](https://github.com/RudrarapuShivakalyan/auth-react)

## Features

- 🔐 User Authentication (Login/Register)
- ✉️ Email Verification
- 🔑 Password Reset Functionality
- 👥 Role-Based Access Control
- 📱 Responsive Design
- 🔒 Secure Password Handling
- 📧 Email Notifications

## Tech Stack

### Frontend
- React.js
- React Router DOM
- Tailwind CSS
- React Icons

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Nodemailer

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Gmail account (for email service)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../auth-react
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_gmail_address
EMAIL_PASSWORD=your_gmail_app_password
PORT=5000
```

Note: For Gmail, you need to:
1. Enable 2-Step Verification
2. Generate an App Password
3. Use the App Password in EMAIL_PASSWORD

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd auth-react
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/send-verification` - Send verification code
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

## User Roles

The system supports the following roles:
- Buyer
- Tenant
- Owner
- User
- Admin
- Content Creator

## Project Structure

```
├── backend/
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth.js
│   ├── utils/
│   │   └── emailService.js
│   └── server.js
└── auth-react/
    ├── src/
    │   ├── components/
    │   │   ├── AuthForm.js
    │   │   └── VerifyEmail.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

## Security Features

- Password hashing using bcrypt
- JWT token authentication
- Email verification
- Secure password reset flow
- Protected routes
- Input validation

## Support

For support, email hardiksharma08300@gmail.com or create an issue in the repository.

## Acknowledgments

- React.js community
- Node.js community
- MongoDB community
- All contributors who have helped with the project
