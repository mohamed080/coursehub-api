/**
 * @openapi
 * tags:
 *   - name: Coupons
 *     description: Coupon management
 */

/**
 * @openapi
 * /api/coupons/validate:
 *   post:
 *     tags:
 *       - Coupons
 *
 *     summary: Validate coupon
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - amount
 *             properties:
 *               code:
 *                 type: string
 *                 example: WELCOME20
 *
 *               amount:
 *                 type: number
 *                 example: 2000
 *
 *
 *     responses:
 *       200:
 *         description: Coupon is valid
 *
 *       400:
 *         description: Invalid coupon
 *
 *       401:
 *         description: Authentication required
 */

/**
 * @openapi
 * /api/coupons:
 *   post:
 *     tags:
 *       - Coupons
 *
 *     summary: Create coupon
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - type
 *               - value
 *
 *             properties:
 *               code:
 *                 type: string
 *                 example: WELCOME20
 *
 *               type:
 *                 type: string
 *                 enum:
 *                   - percentage
 *                   - fixed
 *                 example: percentage
 *
 *               value:
 *                 type: number
 *                 example: 20
 *
 *               maxDiscount:
 *                 type: number
 *                 example: 500
 *
 *               minimumAmount:
 *                 type: number
 *                 example: 1000
 *
 *               usageLimit:
 *                 type: number
 *                 example: 100
 *
 *               expiresAt:
 *                 type: string
 *                 format: date
 *                 example: 2026-12-31
 *
 *
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *
 *       400:
 *         description: Validation error
 */

/**
 * @openapi
 * /api/coupons:
 *   get:
 *     tags:
 *       - Coupons
 *
 *     summary: Get all coupons
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Coupons retrieved successfully
 */

/**
 * @openapi
 * /api/coupons/{id}:
 *   patch:
 *     tags:
 *       - Coupons
 *
 *     summary: Update coupon
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 */

/**
 * @openapi
 * /api/coupons/{id}:
 *   delete:
 *     tags:
 *       - Coupons
 *
 *     summary: Delete coupon
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       204:
 *         description: Coupon deleted successfully
 */
