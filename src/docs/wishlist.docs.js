/**
 * @openapi
 * /api/wishlist/me:
 *   get:
 *     tags:
 *       - Wishlist
 *     summary: Get current user's wishlist
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, price-asc, price-desc]
 *     responses:
 *       200:
 *         description: Wishlist returned successfully
 *
 *   delete:
 *     tags:
 *       - Wishlist
 *     summary: Clear current user's wishlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared successfully
 *
 * /api/wishlist/{courseId}:
 *   post:
 *     tags:
 *       - Wishlist
 *     summary: Add course to wishlist
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
 *         description: Course added to wishlist
 *       400:
 *         description: Course is not published or belongs to current user
 *       409:
 *         description: Course already exists in wishlist
 *
 *   delete:
 *     tags:
 *       - Wishlist
 *     summary: Remove course from wishlist
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
 *         description: Course removed from wishlist
 *       404:
 *         description: Course is not in wishlist
 *
 * /api/wishlist/{courseId}/status:
 *   get:
 *     tags:
 *       - Wishlist
 *     summary: Check if a course is wishlisted
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
 *         description: Wishlist status returned successfully
 */