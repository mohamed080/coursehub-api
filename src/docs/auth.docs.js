/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: |
 *       Creates a new user account and returns a JWT access token.
 *
 *       Automatically sends:
 *       - Welcome email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
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
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: StrongPassword123
 *               role:
 *                 type: string
 *                 enum: [user, instructor]
 *                 default: user
 *                 example: instructor
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid request data
 *       409:
 *         description: Email already exists
 *
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Authenticate a user and return a JWT access token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mohamed@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPassword123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current authenticated user
 *       401:
 *         description: Authentication required
 *
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request password reset
 *     description: |
 *       Generates a password reset token.
 *
 *       Automatically sends:
 *       - Password reset email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: mohamed@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent if the account exists
 *       400:
 *         description: Invalid request
 *
 * /api/auth/reset-password/{token}:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset password
 *     description: Reset the user's password using the reset token received by email.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         example: 8a4c5c6d9a7d...
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: NewStrongPassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Token is invalid or expired
 */