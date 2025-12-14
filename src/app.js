const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

const userRoutes = require('./routes/userRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const quizRoutes = require('./routes/quizRoutes');
const postRoutes = require('./routes/postRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const chatRoutes = require('./routes/chatRoutes'); // Import chat routes
const setupSwagger = require('./config/swagger');

// Middlewares
app.use(helmet());
app.use(cors({
    origin: ["http://localhost:5173", "https://progress-uz.vercel.app"],
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Docs
setupSwagger(app);

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/chats', chatRoutes); // Use chat routes
app.use('/api/v1/notifications', require('./routes/notificationRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to the Learning Platform API',
    });
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`,
    });
});

module.exports = app;
