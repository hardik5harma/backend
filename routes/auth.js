const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

// Register route
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role, phoneNumber, address } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = Date.now() + 24 * 3600000; // 24 hours

        // Create new user
        const user = new User({
            email,
            password,
            name,
            role,
            phoneNumber,
            address,
            verificationToken,
            verificationTokenExpires,
            isVerified: false
        });

        await user.save();

        // Send verification email
        try {
            await sendVerificationEmail(email, verificationToken);
            res.status(201).json({
                message: 'Registration successful. Please check your email to verify your account.',
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isVerified: user.isVerified
                }
            });
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // If email fails, remove the verification token
            user.verificationToken = undefined;
            user.verificationTokenExpires = undefined;
            await user.save();
            throw new Error('Failed to send verification email. Please try again later.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message || 'Error creating user' });
    }
});

// Verify email route
router.get('/verify-email/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            verificationToken: req.params.token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying email', error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required',
                errors: {
                    email: !email ? 'Email is required' : null,
                    password: !password ? 'Password is required' : null
                }
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        try {
            // Send reset email
            await sendPasswordResetEmail(email, resetToken);
            res.json({ message: 'Password reset link has been sent to your email' });
        } catch (emailError) {
            console.error('Error sending reset email:', emailError);
            // If email fails, remove the reset token
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            throw new Error('Failed to send reset email. Please try again later.');
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: error.message || 'Error processing forgot password request' });
    }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// Resend verification email route
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = Date.now() + 24 * 3600000; // 24 hours
        await user.save();

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        res.json({ message: 'Verification email has been resent' });
    } catch (error) {
        res.status(500).json({ message: 'Error resending verification email', error: error.message });
    }
});

// Send verification code route
router.post('/send-verification', async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Received verification request for email:', email);

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Generate verification code (6 digits)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Generated verification code:', verificationCode);
        
        // Store verification code in user document
        const user = new User({
            email,
            verificationToken: verificationCode,
            verificationTokenExpires: Date.now() + 10 * 60000, // 10 minutes
            password: 'temporary', // Temporary password that will be updated during registration
            name: 'temporary', // Temporary name that will be updated during registration
            role: 'User' // Default role that will be updated during registration
        });

        await user.save();
        console.log('Saved user with verification code');

        // Send verification email
        try {
            await sendVerificationEmail(email, verificationCode);
            console.log('Verification email sent successfully');
            res.json({ 
                message: 'Verification code sent successfully',
                email: email // Send back the email for confirmation
            });
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
            // If email fails, remove the verification token
            await User.deleteOne({ email });
            throw new Error('Failed to send verification code. Please try again later.');
        }
    } catch (error) {
        console.error('Send verification error:', error);
        res.status(500).json({ message: error.message || 'Error sending verification code' });
    }
});

// Verify email with code route
router.post('/verify-email', async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        if (!email || !verificationCode) {
            return res.status(400).json({ message: 'Email and verification code are required' });
        }

        const user = await User.findOne({
            email,
            verificationToken: verificationCode,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying email', error: error.message });
    }
});

module.exports = router; 