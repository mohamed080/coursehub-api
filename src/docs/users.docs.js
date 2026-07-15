/**
 * @openapi
 * /api/users/me:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Mohamed
 *               lastName:
 *                 type: string
 *                 example: Ayman
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mohamed@example.com
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Email already exists
 *
 *   delete:
 *     tags:
 *       - Users
 *     summary: Deactivate current user account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deactivated successfully
 *       401:
 *         description: Authentication required
 *
 * /api/users/me/password:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update current user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: CurrentPassword123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid password data
 *       401:
 *         description: Current password is incorrect
 *
 * /api/users/me/avatar:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Upload or replace current user avatar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *       400:
 *         description: Invalid image
 *
 *   delete:
 *     tags:
 *       - Users
 *     summary: Remove current user avatar
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar removed successfully
 *
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Admin only.
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, instructor, admin]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Users returned successfully
 *       403:
 *         description: Admin permission required
 *
 * /api/users/{userId}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User returned successfully
 *       404:
 *         description: User not found
 *
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user
 *     description: Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *
 * /api/users/{userId}/role:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update user role
 *     description: Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, instructor, admin]
 *                 example: instructor
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role
 *       404:
 *         description: User not found
 */
