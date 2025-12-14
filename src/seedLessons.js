const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lesson = require('./models/lessonModel');
const User = require('./models/userModel');

dotenv.config({ path: './.env' });

const lessonsData = [
    {
        "title": "Hayotingiz tubdan o'zgarishini ko'rasiz | Iqtibos podcast #30",
        "description": "Hayotni tubdan o‘zgartirish, fikrlash va intizom haqida podkast.",
        "link": "https://www.youtube.com/watch?v=xeZWKO29BQU",
        "duration": "35:24"
    },
    {
        "title": "Sizni hech qanday yo'l bilan yenga olishmaydi | Iqtibos podcast #29",
        "description": "Ruhiy kuch, qat’iyat va bosimga bardosh berish haqida.",
        "link": "https://www.youtube.com/watch?v=DNcsUp4FHjg",
        "duration": "38:42"
    },
    {
        "title": "Hamma muammolaringizni umumiy bir jihati bor | Iqtibos podcast #31",
        "description": "Muammolar ildizi va ularni tizimli hal qilish haqida.",
        "link": "https://www.youtube.com/watch?v=g8Kf55qx3DA",
        "duration": "37:50"
    },
    {
        "title": "15 daqiqa hayotingizni tubdan o'zgartirishga yetadi | Iqtibos podcast #33",
        "description": "Kichik vaqt orqali katta natijaga erishish konsepsiyasi.",
        "link": "https://www.youtube.com/watch?v=SQEcAsEtWRo",
        "duration": "31:56"
    },
    {
        "title": "Umringiz bekor ketyapti, yaratishni boshlang | Iqtibos podcast #36",
        "description": "Ijod qilish, mas’uliyat va o‘sish haqida chuqur suhbat.",
        "link": "https://www.youtube.com/watch?v=8Aj7N5Y7q0U",
        "duration": "31:13"
    },
    {
        "title": "Xonadagi eng aqlli bo'lish yo'li | Iqtibos podcast #38",
        "description": "Ong, bilim va muhit ta’siri haqida.",
        "link": "https://www.youtube.com/watch?v=ZfZZ_869ZYQ",
        "duration": "34:20"
    },
    {
        "title": "Keling buni to'g'irlaymiz | Iqtibos podcast #39",
        "description": "Xatolarni tan olish va ularni to‘g‘rilash madaniyati.",
        "link": "https://www.youtube.com/watch?v=CVdeRm6G2Ks",
        "duration": "33:39"
    },
    {
        "title": "Sizga yetib bo'lmay qoladi | Iqtibos podcast #40",
        "description": "O‘sish, masofa va rivojlanish narxi haqida.",
        "link": "https://www.youtube.com/watch?v=r983Ifk0E8A",
        "duration": "30:16"
    }
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('DB Connected');
    } catch (error) {
        console.error('DB Connection Error:', error);
        process.exit(1);
    }
};

const parseDuration = (durationStr) => {
    // "35:24" -> 35.4
    const parts = durationStr.split(':');
    if (parts.length === 2) {
        const min = parseInt(parts[0], 10);
        const sec = parseInt(parts[1], 10);
        return parseFloat((min + sec / 60).toFixed(1));
    }
    return 0;
};

const seedData = async () => {
    await connectDB();

    try {
        // Find an instructor (admin or teacher)
        const instructor = await User.findOne({ role: { $in: ['admin', 'teacher'] } });

        if (!instructor) {
            console.error('No instructor (admin or teacher) found to assign lessons to.');
            process.exit(1);
        }

        console.log(`Assigning lessons to instructor: ${instructor.name} (${instructor.role})`);

        // Transform Data
        const lessons = lessonsData.map(item => ({
            title: item.title,
            description: item.description,
            videoUrl: item.link,
            duration: parseDuration(item.duration),
            category: 'productivity', // Default category based on content
            instructor: instructor._id
        }));

        // clear existing lessons?
        // await Lesson.deleteMany(); 
        // console.log('Existing lessons cleared.');

        await Lesson.insertMany(lessons);
        console.log('Lessons Seeded Successfully!');

        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
