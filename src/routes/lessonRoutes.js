const express = require('express');
const lessonController = require('../controllers/lessonController');
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /lessons:
 *   get:
 *     summary: Get all lessons
 *     tags: [Lessons]
 *     responses:
 *       200:
 *         description: List of lessons
 *   post:
 *     summary: Create a lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               duration:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lesson created
 *       403:
 *         description: Forbidden
 */
router
    .route('/')
    .get(lessonController.getAllLessons)
    .post(
        authMiddleware.protect,
        authMiddleware.restrictTo('admin', 'teacher'),
        lessonController.createLesson
    );

/**
 * @swagger
 * /lessons/{id}:
 *   get:
 *     summary: Get a lesson by ID
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson data
 *       404:
 *         description: Lesson not found
 *   patch:
 *     summary: Update a lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated lesson
 *   delete:
 *     summary: Delete a lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Lesson deleted
 */
router
    .route('/:id')
    .get(lessonController.getLesson)
    .patch(
        authMiddleware.protect,
        authMiddleware.restrictTo('admin', 'teacher'),
        lessonController.updateLesson
    )
    .delete(
        authMiddleware.protect,
        authMiddleware.restrictTo('admin', 'teacher'),
        lessonController.deleteLesson
    );

router.patch('/:id/like', authMiddleware.protect, lessonController.toggleLike);

router
    .route('/:lessonId/comments')
    .get(commentController.getAllComments)
    .post(authMiddleware.protect, commentController.createComment);

router
    .route('/:lessonId/comments/:id')
    .delete(authMiddleware.protect, commentController.deleteComment);

module.exports = router;
