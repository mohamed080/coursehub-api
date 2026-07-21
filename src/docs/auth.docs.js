/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: |
 *       Creates a new user account.
 *
 *       **Important:** The user must verify their email address before logging in.
 *       A verification email is automatically sent upon registration.
 *       No JWT token is returned at registration.
 *
 *       Automatically sends:
 *       - Email verification email (expires in 24 hours)
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
 *     responses:
 *       201:
 *         description: User registered successfully. Email verification sent.
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
 *     description: |
 *       Authenticate a user and return a JWT access token.
 *
 *       **Note:** User must have verified their email address before login.
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
 *       403:
 *         description: Email not verified or account deactivated
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
 *
 * /api/auth/verify-email/{token}:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Verify user email
 *     description: |
 *       Verifies the user's email address using the verification token received by email.
 *       Upon successful verification, a JWT token is returned and the user can log in.
 *       The verification link expires in 24 hours.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         example: 8a4c5c6d9a7d...
 *     responses:
 *       200:
 *         description: Email verified successfully. JWT token returned.
 *       400:
 *         description: Token is invalid or expired
 *
 * /api/auth/resend-verification:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Resend email verification
 *     description: |
 *       Resends the email verification link to the user's registered email.
 *       Can only be used for unverified accounts.
 *       Rate limited to prevent abuse.
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
 *         description: If an account exists, a verification email has been sent
 *       400:
 *         description: Email is already verified
 *
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: |
 *       Generates a new access token using the refresh token stored in HttpOnly cookies.
 *       The refresh token must be valid and not expired (valid for 7 days).
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *       401:
 *         description: Refresh token is invalid or expired
 *
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     description: Clears the refresh token cookie and logs out the user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Authentication required
 */
