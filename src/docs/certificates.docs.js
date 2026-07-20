/**
 * @openapi
 * /api/certificates/verify/{verificationCode}:
 *   get:
 *     tags:
 *       - Certificates
 *     summary: Publicly verify a certificate
 *     parameters:
 *       - in: path
 *         name: verificationCode
 *         required: true
 *         schema:
 *           type: string
 *           example: COURSEHUB-2026-A81BC903FA22
 *     responses:
 *       200:
 *         description: Certificate verification result
 *       404:
 *         description: Certificate not found
 *
 * /api/certificates/me:
 *   get:
 *     tags:
 *       - Certificates
 *     summary: Get current user's certificates
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
 *       - in: query
 *         name: isValid
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificates returned successfully
 *
 * /api/certificates/courses/{courseId}:
 *   post:
 *     tags:
 *       - Certificates
 *     summary: Generate course completion certificate
 *     description: |
 *       Generates a certificate after the student has completed the course.
 *
 *       Automatically sends:
 *       - Certificate email to the student
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
 *         description: Certificate generated successfully
 *       200:
 *         description: Existing certificate returned
 *       403:
 *         description: Course completion required
 *       404:
 *         description: Course not found
 *
 * /api/certificates:
 *   get:
 *     tags:
 *       - Certificates
 *     summary: Get all certificates
 *     description: Admin only.
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
 *       - in: query
 *         name: isValid
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *       - in: query
 *         name: course
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificates returned successfully
 *       403:
 *         description: Admin permission required
 *
 * /api/certificates/{certificateId}:
 *   get:
 *     tags:
 *       - Certificates
 *     summary: Get certificate by ID
 *     description: Certificate owner or admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate returned successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Certificate not found
 *
 * /api/certificates/{certificateId}/revoke:
 *   patch:
 *     tags:
 *       - Certificates
 *     summary: Revoke certificate
 *     description: Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *                 example: Certificate was issued using invalid completion records.
 *     responses:
 *       200:
 *         description: Certificate revoked successfully
 *       409:
 *         description: Certificate is already revoked
 *
 * /api/certificates/{certificateId}/restore:
 *   patch:
 *     tags:
 *       - Certificates
 *     summary: Restore revoked certificate
 *     description: Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate restored successfully
 *       409:
 *         description: Certificate is already valid
 */
