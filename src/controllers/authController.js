const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/userModel');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '90d',
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    user.password = undefined; // Remove password from output

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.register = async (req, res) => {
    try {
        const newUser = await User.create({
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role || 'student', // Allow role for now, or restrict
        });

        createSendToken(newUser, 201, res);
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1) Check if email/username and password exist
        if (!email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide email/username and password!',
            });
        }

        // 2) Check if user exists && password is correct
        // Check if input looks like an email using regex, otherwise treat as username
        const isEmail = /^\S+@\S+\.\S+$/.test(email);
        const query = isEmail ? { email: email } : { username: email };

        const user = await User.findOne(query).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect email/username or password',
            });
        }

        // 3) If everything ok, send token to client
        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        let userData;

        // Try verifying as ID Token first
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            userData = {
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                sub: payload.sub
            };
        } catch (idTokenError) {
            // If ID Token verification fails, try as Access Token
            try {
                const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                userData = {
                    name: response.data.name,
                    email: response.data.email,
                    picture: response.data.picture,
                    sub: response.data.sub
                };
            } catch (accessTokenError) {
                throw new Error('Invalid token');
            }
        }

        const { name, email, picture, sub } = userData;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                googleId: sub,
                avatar: picture,
                password: Math.random().toString(36).slice(-8) + 'Aa1!',
                role: 'student'
            });
        } else if (!user.googleId) {
            user.googleId = sub;
            user.avatar = picture;
            await user.save({ validateBeforeSave: false });
        }

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: 'Google login failed: ' + err.message,
        });
    }
};

exports.updatePassword = async (req, res, next) => {
    try {
        // 1) Get user from collection
        const user = await User.findById(req.user.id).select('+password');

        // 2) Check if POSTed current password is correct
        if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Your current password is wrong',
            });
        }

        // 3) If so, update password
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();

        // 4) Log user in, send JWT
        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.protect = async (req, res, next) => {
    try {
        // 1) Getting token and check of it's there
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                status: 'fail',
                message: 'You are not logged in! Please log in to get access.',
            });
        }

        // 2) Verification token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                status: 'fail',
                message: 'The user belonging to this token does no longer exist.',
            });
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        next();
    } catch (err) {
        res.status(401).json({
            status: 'fail',
            message: 'Invalid token or authorization failed.',
        });
    }
};
