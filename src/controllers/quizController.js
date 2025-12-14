const Quiz = require('../models/quizModel');

exports.getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        res.status(200).json({
            status: 'success',
            results: quizzes.length,
            data: { quizzes },
        });
    } catch (err) {
        res.status(404).json({ status: 'fail', message: err.message });
    }
};

exports.deleteQuiz = async (req, res) => {
    try {
        await Quiz.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        res.status(404).json({ status: 'fail', message: err.message });
    }
};

exports.updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!quiz) {
            return res.status(404).json({ status: 'fail', message: 'No quiz found with that ID' });
        }

        res.status(200).json({
            status: 'success',
            data: { quiz }
        });
    } catch (err) {
        res.status(404).json({ status: 'fail', message: err.message });
    }
};

exports.createQuiz = async (req, res) => {
    try {
        const newQuiz = await Quiz.create(req.body);
        res.status(201).json({
            status: 'success',
            data: { quiz: newQuiz },
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

exports.getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ status: 'fail', message: 'No quiz found with that ID' });
        }
        // Remove correct options if student (optional logic, kept simple for now)

        res.status(200).json({
            status: 'success',
            data: { quiz },
        });
    } catch (err) {
        res.status(404).json({ status: 'fail', message: err.message });
    }
};

exports.evaluateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ status: 'fail', message: 'No quiz found with that ID' });
        }

        const { answers } = req.body; // Array of indices e.g., [0, 2, 1]

        if (!answers || answers.length !== quiz.questions.length) {
            return res.status(400).json({
                status: 'fail',
                message: `Please provide answers for all ${quiz.questions.length} questions`
            });
        }

        let score = 0;
        const results = quiz.questions.map((q, i) => {
            const isCorrect = q.correctOption === answers[i];
            if (isCorrect) score++;
            return {
                question: q.question,
                yourAnswer: q.options[answers[i]],
                correctAnswer: q.options[q.correctOption],
                isCorrect
            };
        });

        const percentage = (score / quiz.questions.length) * 100;

        // Here we could save the result to a hypothetical 'Result' model linked to User

        res.status(200).json({
            status: 'success',
            data: {
                score,
                total: quiz.questions.length,
                percentage,
                results
            },
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
