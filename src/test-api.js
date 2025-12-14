const assert = require('assert');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('./app'); // Import app directly

let mongoServer;
let server;
const PORT = 5001; // Use different port for testing
const BASE_URL = `http://localhost:${PORT}/api/v1`;

let studentToken = '';
let adminToken = '';

async function startServer() {
    // 1. Start MongoMemoryServer
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // 2. Connect Mongoose
    await mongoose.connect(uri);
    console.log('✅ Connected to In-Memory MongoDB');

    // 3. Start Express Server
    return new Promise((resolve) => {
        server = app.listen(PORT, () => {
            console.log(`✅ Test Server running on port ${PORT}`);
            resolve();
        });
    });
}

async function runTests() {
    try {
        await startServer();

        console.log('--- Starting API Tests ---');

        // 1. Register Student
        console.log('1. Registering Student...');
        const studentUser = {
            name: 'Student User',
            email: `student-${Date.now()}@test.com`,
            password: 'password123'
        };
        const resReg = await fetch(`${BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentUser)
        });
        const dataReg = await resReg.json();
        if (dataReg.status !== 'success') throw new Error(dataReg.message || 'Registration failed');
        studentToken = dataReg.token;
        console.log('✅ Student Registered');

        // 2. Register Admin
        console.log('2. Registering Admin...');
        const adminUser = {
            name: 'Admin User',
            email: `admin-${Date.now()}@test.com`,
            password: 'password123',
            role: 'admin'
        };
        const resRegAdmin = await fetch(`${BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminUser)
        });
        const dataRegAdmin = await resRegAdmin.json();
        adminToken = dataRegAdmin.token;
        console.log('✅ Admin Registered');

        // 3. Create Lesson (as Student) - Should Fail
        console.log('3. Testing Access Control (Student creating lesson)...');
        const lesson = {
            title: 'Intro to API',
            videoUrl: 'http://video.com/1',
            duration: 10,
            category: 'programming',
            instructor: '5c8a1d5b0190b214360dc001'
        };
        const resCreateFail = await fetch(`${BASE_URL}/lessons`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${studentToken}`
            },
            body: JSON.stringify(lesson)
        });
        assert.strictEqual(resCreateFail.status, 403);
        console.log('✅ Student blocked from creating lesson');

        // 4. Create Lesson (as Admin) - Should Success
        console.log('4. Creating Lesson as Admin...');
        const resCreate = await fetch(`${BASE_URL}/lessons`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(lesson)
        });
        const dataCreate = await resCreate.json();
        if (dataCreate.status !== 'success') throw new Error(dataCreate.message || 'Create lesson failed');
        console.log('✅ Lesson Created');

        // 5. Get All Lessons
        console.log('5. Fetching All Lessons...');
        const resGet = await fetch(`${BASE_URL}/lessons`);
        const dataGet = await resGet.json();
        assert.ok(dataGet.results >= 1);
        console.log('✅ Lessons Fetched:', dataGet.results);

        console.log('--- ALL TESTS PASSED ---');
    } catch (err) {
        console.error('❌ Test Failed:', err.message);
        console.error(err);
    } finally {
        // Cleanup
        if (server) server.close();
        await mongoose.disconnect();
        if (mongoServer) await mongoServer.stop();
        process.exit();
    }
}

runTests();
