/**
 * @openapi
 * /api/sections/{sectionId}/lessons:
 *   get:
 *     tags:
 *       - Lessons
 *     summary: Get lessons in a section
 *     description: Locked lesson videos are hidden from unauthorized users.
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lessons returned successfully
 *
 *   post:
 *     tags:
 *       - Lessons
 *     summary: Create lesson with video
 *     description: Course instructor or admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - order
 *               - video
 *             properties:
 *               title:
 *                 type: string
 *                 example: Introduction to Node.js
 *               description:
 *                 type: string
 *                 example: Learn how the Node.js runtime works.
 *               order:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               isPreview:
 *                 type: boolean
 *                 default: false
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *       403:
 *         description: Course ownership or admin permission required
 *       409:
 *         description: Lesson order already exists
 *
 * /api/lessons/{lessonId}:
 *   get:
 *     tags:
 *       - Lessons
 *     summary: Get lesson by ID
 *     description: Preview lessons are public. Other lessons require enrollment.
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson returned successfully
 *       403:
 *         description: Enrollment required
 *       404:
 *         description: Lesson not found
 *
 *   patch:
 *     tags:
 *       - Lessons
 *     summary: Update lesson
 *     description: Course instructor or admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: integer
 *               isPreview:
 *                 type: boolean
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *       403:
 *         description: Permission denied
 *
 *   delete:
 *     tags:
 *       - Lessons
 *     summary: Delete lesson
 *     description: Deletes the lesson, video, and related progress records.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
 */
