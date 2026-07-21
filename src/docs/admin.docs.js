/**
 * @openapi
 * /api/admin/dashboard:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Get platform-wide KPI summary
 *     description: Returns high-level statistics for users, courses, enrollments, revenue, and payments. Admin only.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary returned successfully
 *       403:
 *         description: Admin access required
 *
 * /api/admin/revenue:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Get monthly revenue chart
 *     description: Returns monthly revenue and sales buckets for the given year or custom date range. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *         description: Year (defaults to current year)
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Monthly revenue returned successfully
 *
 * /api/admin/enrollments:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Get monthly enrollment chart
 *     description: Returns monthly enrollment count buckets for the given year or date range. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Monthly enrollments returned successfully
 *
 * /api/admin/users/growth:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Get monthly user growth chart
 *     description: Returns monthly new-user registration buckets for the given year or date range. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Monthly user growth returned successfully
 *
 * /api/admin/top-courses:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Get top courses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [revenue, students, rating] }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Top courses returned successfully
 *
 * /api/admin/top-instructors:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Get top instructors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [revenue, students] }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Top instructors returned successfully
 *
 * /api/admin/users:
 *   get:
 *     tags:
 *       - Admin Management - Users
 *     summary: List & search users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name or email
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [user, instructor, admin] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, blocked, true, false] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Users list returned successfully
 *
 * /api/admin/users/{id}:
 *   get:
 *     tags:
 *       - Admin Management - Users
 *     summary: Get user profile & history by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User profile returned successfully
 *   delete:
 *     tags:
 *       - Admin Management - Users
 *     summary: Delete user account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted successfully
 *
 * /api/admin/users/{id}/status:
 *   patch:
 *     tags:
 *       - Admin Management - Users
 *     summary: Block/unblock user or change role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive: { type: boolean }
 *               role: { type: string, enum: [user, instructor, admin] }
 *     responses:
 *       200:
 *         description: User status updated successfully
 *
 * /api/admin/courses:
 *   get:
 *     tags:
 *       - Admin Management - Courses
 *     summary: List all courses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, published, archived] }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: instructor
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Courses list returned successfully
 *
 * /api/admin/courses/{id}:
 *   get:
 *     tags:
 *       - Admin Management - Courses
 *     summary: Get course details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course details returned successfully
 *   delete:
 *     tags:
 *       - Admin Management - Courses
 *     summary: Delete course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *
 * /api/admin/courses/{id}/status:
 *   patch:
 *     tags:
 *       - Admin Management - Courses
 *     summary: Change course status (approve/reject/archive)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [draft, published, archived] }
 *     responses:
 *       200:
 *         description: Course status updated successfully
 *
 * /api/admin/instructors:
 *   get:
 *     tags:
 *       - Admin Management - Instructors
 *     summary: List instructors & performance metrics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: isVerified
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Instructors list returned successfully
 *
 * /api/admin/instructors/{id}/verify:
 *   patch:
 *     tags:
 *       - Admin Management - Instructors
 *     summary: Verify or unverify instructor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isVerified: { type: boolean }
 *     responses:
 *       200:
 *         description: Instructor verification status updated successfully
 *
 * /api/admin/instructors/requests:
 *   get:
 *     tags:
 *       - Admin Management - Instructors
 *     summary: List pending instructor requests
 *     description: Returns users who have requested to become an instructor (instructorStatus = pending). Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Pending instructor requests returned successfully
 *
 * /api/admin/instructors/{id}/approve:
 *   patch:
 *     tags:
 *       - Admin Management - Instructors
 *     summary: Approve instructor request
 *     description: Sets user role to instructor, instructorStatus to approved, and isInstructorVerified to true. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Instructor request approved successfully
 *       404:
 *         description: User not found
 *
 * /api/admin/instructors/{id}/reject:
 *   patch:
 *     tags:
 *       - Admin Management - Instructors
 *     summary: Reject instructor request
 *     description: Sets user role back to user, instructorStatus to rejected, and isInstructorVerified to false. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Instructor request rejected successfully
 *       404:
 *         description: User not found
 *
 * /api/admin/payments:
 *   get:
 *     tags:
 *       - Admin Management - Payments
 *     summary: List all payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [paid, pending, failed] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Payments returned successfully
 *
 * /api/admin/payments/{id}:
 *   get:
 *     tags:
 *       - Admin Management - Payments
 *     summary: Get payment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payment details returned successfully
 *
 * /api/admin/payments/{id}/refund:
 *   patch:
 *     tags:
 *       - Admin Management - Payments
 *     summary: Refund payment & cancel enrollment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payment refunded successfully
 *
 * /api/admin/reviews:
 *   get:
 *     tags:
 *       - Admin Management - Reviews
 *     summary: List & moderate reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: rating
 *         schema: { type: integer }
 *       - in: query
 *         name: course
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Reviews list returned successfully
 *
 * /api/admin/reviews/{id}:
 *   delete:
 *     tags:
 *       - Admin Management - Reviews
 *     summary: Delete inappropriate review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *
 * /api/admin/activity:
 *   get:
 *     tags:
 *       - Admin Activity
 *     summary: Get recent platform activity feed
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Activity feed returned successfully
 *
 * /api/admin/export/users:
 *   get:
 *     tags:
 *       - Admin Export Reports
 *     summary: Export users report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [csv, json] }
 *     responses:
 *       200:
 *         description: Users report exported successfully
 *
 * /api/admin/export/revenue:
 *   get:
 *     tags:
 *       - Admin Export Reports
 *     summary: Export revenue & transactions report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [csv, json] }
 *     responses:
 *       200:
 *         description: Revenue report exported successfully
 *
 * /api/admin/export/courses:
 *   get:
 *     tags:
 *       - Admin Export Reports
 *     summary: Export courses report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [csv, json] }
 *     responses:
 *       200:
 *         description: Courses report exported successfully
 */
