/**
 * @openapi
 * tags:
 *   - name: Payments
 *     description: Payment management and Paymob integration
 */

/**
 * @openapi
 * /api/payments/checkout/{courseId}:
 *   post:
 *     tags:
 *       - Payments
 *
 *     summary: Create Paymob checkout session
 *
 *     description:
 *       Creates a pending payment and returns Paymob iframe URL.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         example: 65f123456789
 *
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coupon:
 *                 type: string
 *                 example: WELCOME20
 *
 *
 *     responses:
 *
 *       200:
 *         description: Checkout created successfully
 *
 *       400:
 *         description: Course unavailable
 *
 *       401:
 *         description: Authentication required
 *
 */

/**
 * @openapi
 * /api/payments:
 *   get:
 *     tags:
 *       - Payments
 *
 *     summary: Get current user payments
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *
 *       200:
 *         description: Payments returned successfully
 *
 *       401:
 *         description: Authentication required
 *
 */

/**
 * @openapi
 * /api/payments/webhook:
 *   post:
 *     tags:
 *       - Payments
 *
 *     summary: Paymob webhook callback
 *
 *     description:
 *       Receives payment status updates from Paymob.
 *
 *     responses:
 *
 *       200:
 *         description: Webhook received
 *
 *       403:
 *         description: Invalid HMAC
 *
 */
