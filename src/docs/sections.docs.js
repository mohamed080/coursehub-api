/**
 * @openapi
 * /api/courses/{courseId}/sections:
 *   get:
 *     tags:
 *       - Sections
 *     summary: Get all sections for a course
 *     parameters:
 *       - in: path
 *         name: courseId
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
 *         description: Sections returned successfully
 *
 *   post:
 *     tags:
 *       - Sections
 *     summary: Create a course section
 *     description: Course instructor or admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - order
 *             properties:
 *               title:
 *                 type: string
 *                 example: Node.js Fundamentals
 *               description:
 *                 type: string
 *               order:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *     responses:
 *       201:
 *         description: Section created successfully
 *       409:
 *         description: Section order already exists
 *
 * /api/sections/{sectionId}:
 *   get:
 *     tags:
 *       - Sections
 *     summary: Get section by ID
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Section returned successfully
 *
 *   patch:
 *     tags:
 *       - Sections
 *     summary: Update section
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Section updated successfully
 *
 *   delete:
 *     tags:
 *       - Sections
 *     summary: Delete section
 *     description: Deletes related lessons, videos, and progress records.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Section deleted successfully
 */
