/**
 * @openapi
 * components:
 *   schemas:
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: fail
 *         message:
 *           type: string
 *           example: Resource not found
 *         code:
 *           type: integer
 *           example: 404
 *         data:
 *           nullable: true
 *           example: null
 *
 *     ValidationError:
 *       type: object
 *       properties:
 *         field:
 *           type: string
 *           example: email
 *         message:
 *           type: string
 *           example: Email is required
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         currentPage:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         totalPages:
 *           type: integer
 *           example: 5
 *         hasNextPage:
 *           type: boolean
 *           example: true
 *         hasPreviousPage:
 *           type: boolean
 *           example: false
 *
 *     Image:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *           example: https://res.cloudinary.com/example/image/upload/image.jpg
 *         publicId:
 *           type: string
 *           nullable: true
 *           example: coursehub/uploads/image
 *
 *     Video:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *         publicId:
 *           type: string
 *         duration:
 *           type: number
 *           example: 120.5
 *         format:
 *           type: string
 *           example: mp4
 *         bytes:
 *           type: integer
 *           example: 4372373
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6a544e1bb3f77b48bed5fff0
 *         firstName:
 *           type: string
 *           example: Mohamed
 *         lastName:
 *           type: string
 *           example: Ayman
 *         email:
 *           type: string
 *           format: email
 *           example: mohamed@example.com
 *         role:
 *           type: string
 *           enum:
 *             - user
 *             - admin
 *           example: user
 *         isActive:
 *           type: boolean
 *           example: true
 *         avatar:
 *           $ref: '#/components/schemas/Image'
 *
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: Web Development
 *         slug:
 *           type: string
 *           example: web-development
 *         description:
 *           type: string
 *         isActive:
 *           type: boolean
 *           example: true
 *
 *     Course:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *           example: Node.js REST API Masterclass
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           example: 2000
 *         status:
 *           type: string
 *           enum:
 *             - draft
 *             - published
 *             - archived
 *         coverImage:
 *           $ref: '#/components/schemas/Image'
 *         gallery:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Image'
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         instructor:
 *           $ref: '#/components/schemas/User'
 *         averageRating:
 *           type: number
 *           example: 4.5
 *         ratingsCount:
 *           type: integer
 *           example: 10
 *
 *     Section:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *           example: Node.js Fundamentals
 *         description:
 *           type: string
 *         order:
 *           type: integer
 *           example: 1
 *         course:
 *           type: string
 *
 *     Lesson:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *           example: Introduction to Node.js
 *         description:
 *           type: string
 *         order:
 *           type: integer
 *           example: 1
 *         isPreview:
 *           type: boolean
 *           example: true
 *         video:
 *           $ref: '#/components/schemas/Video'
 *         section:
 *           type: string
 *         course:
 *           type: string
 *
 *     Enrollment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *         course:
 *           $ref: '#/components/schemas/Course'
 *         status:
 *           type: string
 *           enum:
 *             - active
 *             - completed
 *         progress:
 *           type: number
 *           example: 60
 *         enrolledAt:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         comment:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *         course:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     ProgressSummary:
 *       type: object
 *       properties:
 *         totalLessons:
 *           type: integer
 *           example: 10
 *         completedLessons:
 *           type: integer
 *           example: 6
 *         remainingLessons:
 *           type: integer
 *           example: 4
 *         progressPercentage:
 *           type: number
 *           example: 60
 *         isCompleted:
 *           type: boolean
 *           example: false
 *
 *     Certificate:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         verificationCode:
 *           type: string
 *           example: COURSEHUB-2026-A81BC903FA22
 *         issuedAt:
 *           type: string
 *           format: date-time
 *         isValid:
 *           type: boolean
 *           example: true
 *         revokedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         revokedReason:
 *           type: string
 *           nullable: true
 *         user:
 *           $ref: '#/components/schemas/User'
 *         course:
 *           $ref: '#/components/schemas/Course'
 */