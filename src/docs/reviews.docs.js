/**
 * @openapi
 * /api/reviews/courses/{courseId}:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Get all reviews for a course
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
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, rating-high, rating-low]
 *     responses:
 *       200:
 *         description: Course reviews returned successfully
 *       404:
 *         description: Course not found
 *
 *   post:
 *     tags:
 *       - Reviews
 *     summary: Create a course review
 *     description: The user must be enrolled in the course.
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
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 example: This course explains the concepts clearly.
 *     responses:
 *       201:
 *         description: Review created successfully
 *       403:
 *         description: Enrollment required
 *       409:
 *         description: User already reviewed the course
 *
 * /api/reviews/courses/{courseId}/me:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Get current user's review for a course
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
 *         description: Current user's review status returned successfully
 *
 * /api/reviews/me:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Get current user's reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: User reviews returned successfully
 *
 * /api/reviews/{reviewId}:
 *   patch:
 *     tags:
 *       - Reviews
 *     summary: Update current user's review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
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
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       403:
 *         description: Review ownership required
 *       404:
 *         description: Review not found
 *
 *   delete:
 *     tags:
 *       - Reviews
 *     summary: Delete a review
 *     description: Review owner or admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       403:
 *         description: Permission denied
 */