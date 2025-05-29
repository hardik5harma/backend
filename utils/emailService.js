const nodemailer = require('nodemailer');

// Create transporter with error handling
let transporter;
try {
    console.log('Creating email transporter with:', {
        service: 'gmail',
        user: process.env.EMAIL_USER,
        // Don't log the actual password
        hasPassword: !!process.env.EMAIL_PASSWORD
    });

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        debug: true // Enable debug logging
    });

    // Verify transporter configuration
    transporter.verify(function(error, success) {
        if (error) {
            console.error('Email configuration error:', error);
        } else {
            console.log('Email server is ready to send messages');
        }
    });
} catch (error) {
    console.error('Error creating email transporter:', error);
}

const sendVerificationEmail = async (email, verificationToken) => {
    if (!transporter) {
        console.error('Transporter not initialized. Check if EMAIL_USER and EMAIL_PASSWORD are set in .env');
        throw new Error('Email service not configured. Please check your .env file.');
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('Missing email configuration:', {
            hasEmailUser: !!process.env.EMAIL_USER,
            hasEmailPassword: !!process.env.EMAIL_PASSWORD
        });
        throw new Error('Email configuration is incomplete. Please check your .env file.');
    }

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email',
        html: `
            <h1>Email Verification</h1>
            <p>Thank you for registering! Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
        `
    };

    try {
        console.log('Attempting to send verification email to:', email);
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully:', info.response);
        return true;
    } catch (error) {
        console.error('Detailed error sending verification email:', {
            error: error.message,
            code: error.code,
            command: error.command,
            responseCode: error.responseCode,
            response: error.response
        });
        throw new Error('Failed to send verification email. Please try again later.');
    }
};

const sendPasswordResetEmail = async (email, resetToken) => {
    if (!transporter) {
        console.error('Transporter not initialized. Check if EMAIL_USER and EMAIL_PASSWORD are set in .env');
        throw new Error('Email service not configured. Please check your .env file.');
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('Missing email configuration:', {
            hasEmailUser: !!process.env.EMAIL_USER,
            hasEmailPassword: !!process.env.EMAIL_PASSWORD
        });
        throw new Error('Email configuration is incomplete. Please check your .env file.');
    }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Please click the link below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `
    };

    try {
        console.log('Attempting to send password reset email to:', email);
        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully:', info.response);
        return true;
    } catch (error) {
        console.error('Detailed error sending password reset email:', {
            error: error.message,
            code: error.code,
            command: error.command,
            responseCode: error.responseCode,
            response: error.response
        });
        throw new Error('Failed to send password reset email. Please try again later.');
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
}; 