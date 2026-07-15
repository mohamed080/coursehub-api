/**
 * @openapi
 * /api/enrollments/me:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get current user's enrollments
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed]
 *     responses:
 *       200:
 *         description: Enrollments returned successfully
 *
 * /api/enrollments/{courseId}:
 *   post:
 *     tags:
 *       - Enrollments
 *     summary: Enroll current user in a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Enrollment created successfully
 *       400:
 *         description: Course is not published or user owns the course
 *       404:
 *         description: Course not found
 *       409:
 *         description: User is already enrolled
 *
 *   delete:
 *     tags:
 *       - Enrollments
 *     summary: Cancel current user's enrollment
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
 *         description: Enrollment cancelled successfully
 *       404:
 *         description: Enrollment not found
 *
 * /api/enrollments/{courseId}/status:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Check current user's enrollment status
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
 *         description: Enrollment status returned successfully
 *
 * /api/enrollments/{courseId}/students:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get students enrolled in a course
 *     description: Course owner or admin only.
 *     security:
 *       - bearerAuth: []
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed]
 *     responses:
 *       200:
 *         description: Enrolled students returned successfully
 *       403:
 *         description: Course ownership or admin permission required
 *
 * /api/enrollments/{courseId}/students/{enrollmentId}:
 *   delete:
 *     tags:
 *       - Enrollments
 *     summary: Remove a student enrollment
 *     description: Course owner or admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student enrollment removed successfully
 *       404:
 *         description: Enrollment not found
 */