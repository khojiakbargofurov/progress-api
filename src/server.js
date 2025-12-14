require('dotenv').config();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config({ path: './.env' });

const app = require('./app');

const DataBase = async () => {
    let mongoUri = process.env.MONGO_URI;

    try {
        // Try connecting to the provided URI (e.g., local or cloud)
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000 // Fail fast if no local DB
        });
        console.log('DB connection successful!');
    } catch (err) {
        console.log('Local MongoDB not found. Starting In-Memory Database...');
        try {
            const mongod = await MongoMemoryServer.create();
            mongoUri = mongod.getUri();
            await mongoose.connect(mongoUri);
            console.log('In-Memory DB connection successful!');
            console.log(`URI: ${mongoUri}`);

            // Seed Admin User
            const User = require('./models/userModel');
            await User.create({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                passwordConfirm: 'password123',
                role: 'admin',
            });
            console.log('Admin user seeded: admin@example.com / password123');

        } catch (memErr) {
            console.error('Failed to start In-Memory DB:', memErr);
        }
    }
};

const socketIo = require('socket.io');
const Message = require('./models/messageModel');

const startServer = async () => {
    await DataBase();

    const port = process.env.PORT || 5000;
    const server = app.listen(port, () => {
        console.log(`App running on port ${port}...`);
    });

    const io = socketIo(server, {
        cors: {
            cors: {
                origin: ["http://localhost:5173", "https://progress-uz.vercel.app"], // Allow frontend
                methods: ["GET", "POST"]
            }
        }
    });

    global.io = io;

    io.on('connection', (socket) => {
        console.log('New client connected: ' + socket.id);

        socket.on('join', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined room ${userId}`);
        });

        socket.on('sendMessage', async (data) => {
            const { sender, receiver, message } = data;

            // Save to DB
            try {
                const newMessage = await Message.create({ sender, receiver, message });

                // Emit to receiver
                io.to(receiver).emit('receiveMessage', newMessage);
                // Emit back to sender (for confirmation/multi-device)
                socket.emit('messageSent', newMessage);
            } catch (err) {
                console.error('Error saving message:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
