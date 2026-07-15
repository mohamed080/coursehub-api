/**
 * @openapi
 * /api/lessons/{lessonId}/complete:
 *   post:
 *     tags:
 *       - Progress
 *     summary: Mark lesson as completed
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Lesson marked as completed
 *       403:
 *         description: Enrollment required
 *       409:
 *         description: Lesson already completed
 *
 *   delete:
 *     tags:
 *       - Progress
 *     summary: Remove lesson completion
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
 *         description: Lesson completion removed successfully
 *       404:
 *         description: Lesson is not marked as completed
 *
 * /api/lessons/{lessonId}/complete/status:
 *   get:
 *     tags:
 *       - Progress
 *     summary: Check lesson completion status
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
 *         description: Completion status returned successfully
 *       403:
 *         description: Enrollment required
 *
 * /api/courses/{courseId}/progress:
 *   get:
 *     tags:
 *       - Progress
 *     summary: Get current user's course progress
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course progress returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     progressSummary:
 *                       $ref: '#/components/schemas/ProgressSummary'
 *       403:
 *         description: Enrollment required
 */