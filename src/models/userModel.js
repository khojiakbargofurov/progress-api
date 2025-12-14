const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
        trim: true,
    },
    username: {
        type: String,
        unique: true,
        sparse: true, // Allows null/undefined values to not conflict
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address',
        ],
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student',
    },
    googleId: String,
    avatar: String,
    password: {
        type: String,
        required: [function () { return !this.googleId; }, 'Please provide a password'], // Only required if not google login
        minlength: 8,
        select: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Pre-save middleware to hash password
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Instance method to check password
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
