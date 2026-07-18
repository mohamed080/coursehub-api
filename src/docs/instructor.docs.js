/**
 * @openapi
 * tags:
 *   - name: Instructor
 *     description: Instructor dashboard and analytics
 */

/**
 * @openapi
 * /api/instructor/dashboard:
 *   get:
 *     tags:
 *       - Instructor
 *     summary: Get instructor dashboard summary
 *     description: Returns course, student, revenue, sales, and rating totals for the authenticated instructor. Admins may pass instructorId as a query parameter.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: instructorId
 *         schema:
 *           type: string
 *         description: Admin-only instructor filter.
 *     responses:
 *       200:
 *         description: Dashboard summary returned successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Instructor or admin permission required
 */

/**
 * @openapi
 * /api/instructor/courses:
 *   get:
 *     tags:
 *       - Instructor
 *     summary: Get instructor courses with analytics
 *     description: Returns paginated instructor courses with revenue, student, sales, and rating metrics per course.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *       - in: query
 *         name: instructorId
 *         schema:
 *           type: string
 *         description: Admin-only instructor filter.
 *     responses:
 *       200:
 *         description: Instructor courses returned successfully
 */

/**
 * @openapi
 * /api/instructor/revenue:
 *   get:
 *     tags:
 *       - Instructor
 *     summary: Get instructor revenue analytics
 *     description: Returns total revenue, total sales, and a 12-month revenue chart for paid payments.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2026
 *       - in: query
 *         name: instructorId
 *         schema:
 *           type: string
 *         description: Admin-only instructor filter.
 *     responses:
 *       200:
 *         description: Revenue analytics returned successfully
 */

/**
 * @openapi
 * /api/instructor/enrollments:
 *   get:
 *     tags:
 *       - Instructor
 *     summary: Get instructor enrollment analytics
 *     description: Returns total, active, completed, and monthly enrollment analytics.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2026
 *       - in: query
 *         name: instructorId
 *         schema:
 *           type: string
 *         description: Admin-only instructor filter.
 *     responses:
 *       200:
 *         description: Enrollment analytics returned successfully
 */

/**
 * @openapi
 * /api/instructor/top-courses:
 *   get:
 *     tags:
 *       - Instructor
 *     summary: Get instructor top courses
 *     description: Returns top instructor courses sorted by revenue, students, or rating.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [revenue, students, rating]
 *           default: revenue
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *       - in: query
 *         name: instructorId
 *         schema:
 *           type: string
 *         description: Admin-only instructor filter.
 *     responses:
 *       200:
 *         description: Top courses returned successfully
 */

/**
 * @openapi
 * /api/instructor/courses/{courseId}/analytics:
 *   get:
 *     tags:
 *       - Instructor
 *     summary: Get single course analytics
 *     description: Returns revenue, enrollment, rating, and monthly chart analytics for one instructor-owned course. Admins may access any course.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           example: 2026
 *       - in: query
 *         name: instructorId
 *         schema:
 *           type: string
 *         description: Optional admin filter to ensure the course belongs to a specific instructor.
 *     responses:
 *       200:
 *         description: Course analytics returned successfully
 *       404:
 *         description: Course not found
 */
