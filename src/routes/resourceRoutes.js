const express = require('express');
const resourceController = require('../controllers/resourceController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: Educational resource management
 */

/**
 * @swagger
 * /resources:
 *   get:
 *     summary: Get all resources
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: List of resources
 *   post:
 *     summary: Create a resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - link
 *             properties:
 *               title:
 *                 type: string
 *               link:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Resource created
 */
router
    .route('/')
    .get(resourceController.getAllResources)
    .post(
        authMiddleware.protect,
        authMiddleware.restrictTo('admin', 'teacher'),
        resourceController.createResource
    );

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Get resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resource detail
 *   patch:
 *     summary: Update resource
 *     tags: [Resources]
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
 *               link:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resource updated
 *   delete:
 *     summary: Delete resource
 *     tags: [Resources]
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
 *         description: Resource deleted
 */
router
    .route('/:id')
    .get(resourceController.getResource)
    .patch(
        authMiddleware.protect,
        authMiddleware.restrictTo('admin', 'teacher'),
        resourceController.updateResource
    )
    .delete(
        authMiddleware.restrictTo('admin', 'teacher'),
        resourceController.deleteResource
    );

module.exports = router;
