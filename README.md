# CourseHub API

A scalable RESTful API for an online learning platform built with Node.js, Express.js, MongoDB, JWT authentication, role-based authorization, Cloudinary image uploads, enrollments, and course reviews.

## Features

### Authentication

* User registration and login
* JWT-based authentication
* Get current authenticated user
* Protected routes
* Role-based authorization for users, instructors, and admins

### User Management

* Update current-user profile
* Change password
* Upload, replace, and remove profile avatar
* Deactivate current-user account
* Admin user listing with pagination and search
* Admin user lookup
* Admin role management
* Admin user deletion

### Categories

* Create, read, update, and delete categories
* Category slug generation
* Category activation and deactivation
* Search and pagination
* Prevent deleting categories that contain courses
* Associate courses with active categories

### Courses

* Create, read, update, and delete courses
* Associate courses with instructors and categories
* Course status management:

  * `draft`
  * `published`
  * `archived`
* Course instructor ownership authorization
* Admin course management
* Course search
* Filter by category, instructor, status, and price
* Sort by newest, oldest, and price
* Pagination
* Cover image upload and replacement
* Automatic Cloudinary cleanup when replacing or deleting images

### Course Gallery

* Upload multiple gallery images
* Maximum of 10 images per course
* Retrieve a course gallery
* Delete a single gallery image
* Clear the entire course gallery
* Course instructor and admin permission checks
* Automatic Cloudinary cleanup

### Enrollments

* Enroll in published courses
* Prevent duplicate enrollments
* Prevent instructors from enrolling in their own courses
* Retrieve the current user's enrollments
* Filter enrollments by status
* Check enrollment status for a course
* Cancel enrollment
* Instructor and admin access to enrolled students
* Remove a student enrollment
* Pagination for enrollment results

### Reviews and Ratings

* Only enrolled users can review a course
* Prevent instructors from reviewing their own courses
* One review per user per course
* Rating from 1 to 5
* Create, update, and delete reviews
* Retrieve all reviews for a course
* Retrieve the current user's reviews
* Sort reviews by date or rating
* Automatically calculate:

  * Average course rating
  * Total ratings count

### Wishlist

- Add courses to the current user's wishlist
- Remove courses from the wishlist
- View the current user's wishlist
- Check if a course is already wishlisted
- Clear the entire wishlist
- Prevent duplicate wishlist entries
- Search and pagination

### Coupons

- Admin coupon creation, listing, updating, and deletion
- Fixed-amount and percentage discounts
- Minimum amount, maximum discount, expiry, active status, and usage-limit support
- Prevent users from reusing the same coupon
- Validate coupons before checkout

### Payments

- Paymob checkout integration
- Create pending payments for course purchases
- Optional coupon discounts during checkout
- Return Paymob iframe payment URL
- Store user payment history
- Paymob webhook updates payment status
- Automatically enroll users after successful payment

### Instructor Dashboard and Analytics

- Instructor dashboard summary
- Paginated instructor courses with search and status filtering
- Revenue per course
- Students per course
- Rating per course
- Monthly revenue chart
- Enrollment analytics
- Top courses by revenue, students, or rating
- Single-course analytics

### Sections

- Create, update, and delete course sections
- Order sections within a course
- Only course instructors and admins can manage sections
- Automatically remove lessons when deleting a section

### Lessons

- Create, update, and delete lessons
- Video upload to Cloudinary
- Preview lessons
- Lesson ordering
- Automatic Cloudinary video cleanup
- Only the course instructor and admins can manage lessons

### Progress Tracking

- Mark lessons as completed
- Remove lesson completion
- Track course completion percentage
- Enrollment progress synchronization
- Course completion detection

### Certificates

- Generate course completion certificates
- Unique verification code
- Public certificate verification
- Student certificate history
- Admin revoke and restore certificates

## Email Service 

- Centralized email configuration
- Reusable email sending service
- HTML email templates
- Safe async email delivery
- Password reset email flow
- User registration welcome email
- Course purchase confirmation email
- Certificate generation email
- Instructor enrollment notification
- Coupon creation notification

### File Uploads

* Multer memory storage
* Cloudinary integration
* User avatar upload
* Course cover image upload
* Multiple course gallery image uploads
* File type validation
* Maximum upload size of 5 MB

### API Quality

* Mongoose validation
* Express Validator request validation
* Centralized error handling
* Async controller wrapper
* Pagination helpers
* Reusable authorization and Cloudinary helpers
* Duplicate database constraint handling
* Security middleware with Helmet and CORS
* Development request logging with Morgan

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Token
* bcryptjs
* Multer
* Cloudinary
* express-validator
* Helmet
* CORS
* Morgan
* dotenv
* slugify
* Nodemailer

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/mohamed080/coursehub-api.git
cd coursehub-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the environment file

Copy `.env.example` to `.env`.

Linux or macOS:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Add your environment values:

```env
NODE_ENV=development
PORT=3001

MONGODB_URL=your_mongodb_connection_string

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d

CLIENT_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

DEFAULT_USER_IMAGE=https://res.cloudinary.com/your-cloud/image/upload/default-user.png

PAYMOB_BASE_URL=https://accept.paymob.com
PAYMOB_API_KEY=your_paymob_api_key
PAYMOB_INTEGRATION_ID=your_paymob_integration_id
PAYMOB_IFRAME_ID=your_paymob_iframe_id
PAYMOB_HMAC=your_paymob_hmac_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_SECURE=false
EMAIL_FROM=your-email@gmail.com
```

### 4. Run the server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Default local URL:

```text
http://localhost:3001
```

Health check:

```text
GET /api/health
```

## Authentication

Protected routes require a bearer token:

```text
Authorization: Bearer <token>
```

The access token is returned from the register and login endpoints.

Registration supports two public roles:

```json
{
  "firstName": "Mohamed",
  "lastName": "Ayman",
  "email": "mohamed@example.com",
  "password": "StrongPassword123",
  "role": "instructor"
}
```

If `role` is omitted, the account is created as `user`. Public registration only accepts `user` or `instructor`; the `admin` role can only be assigned by an admin.

## API Routes

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Users

Authenticated user routes:

```text
PATCH  /api/users/me
PATCH  /api/users/me/password
DELETE /api/users/me

PATCH  /api/users/me/avatar
DELETE /api/users/me/avatar
```

Admin routes:

```text
GET    /api/users
GET    /api/users/:userId
PATCH  /api/users/:userId/role
DELETE /api/users/:userId
```

### Categories

Public routes:

```text
GET /api/categories
GET /api/categories/:identifier
```

Admin routes:

```text
POST   /api/categories
PATCH  /api/categories/:categoryId
DELETE /api/categories/:categoryId
```

A category may be retrieved using its MongoDB ID or slug.

Example:

```text
GET /api/categories/web-development
```

### Courses

Public routes:

```text
GET /api/courses
GET /api/courses/:courseId
```

Instructor/admin routes:

```text
POST   /api/courses
PATCH  /api/courses/:courseId
DELETE /api/courses/:courseId
```

Instructors may create courses. A course instructor may update or delete only their own courses. Admins may manage any course.

Example filters:

```text
GET /api/courses?search=node
GET /api/courses?category=<categoryId>
GET /api/courses?status=published
GET /api/courses?minPrice=100&maxPrice=500
GET /api/courses?sort=price-asc
GET /api/courses?page=1&limit=10
```

Supported sort options:

```text
newest
oldest
price-asc
price-desc
```

### Course Gallery

```text
GET    /api/courses/:courseId/gallery
POST   /api/courses/:courseId/gallery
DELETE /api/courses/:courseId/gallery
DELETE /api/courses/:courseId/gallery/:imageId
```

Only the course instructor or an admin may add or remove gallery images.

### Enrollments

Current-user routes:

```text
POST   /api/enrollments/:courseId
GET    /api/enrollments/me
GET    /api/enrollments/:courseId/status
DELETE /api/enrollments/:courseId
```

Instructor and admin routes:

```text
GET    /api/enrollments/:courseId/students
DELETE /api/enrollments/:courseId/students/:enrollmentId
```

Example filters:

```text
GET /api/enrollments/me?status=active
GET /api/enrollments/me?page=1&limit=10
GET /api/enrollments/:courseId/students?status=completed
```

### Reviews

Public route:

```text
GET /api/reviews/courses/:courseId
```

Authenticated routes:

```text
POST   /api/reviews/courses/:courseId
GET    /api/reviews/courses/:courseId/me
GET    /api/reviews/me
PATCH  /api/reviews/:reviewId
DELETE /api/reviews/:reviewId
```

Example review request:

```json
{
  "rating": 5,
  "comment": "This course explains the concepts clearly and practically."
}
```

Example sorting:

```text
GET /api/reviews/courses/:courseId?sort=newest
GET /api/reviews/courses/:courseId?sort=oldest
GET /api/reviews/courses/:courseId?sort=rating-high
GET /api/reviews/courses/:courseId?sort=rating-low
```

### Wishlist

```text
POST   /api/wishlist/:courseId
GET    /api/wishlist/me
GET    /api/wishlist/:courseId/status
DELETE /api/wishlist/:courseId
DELETE /api/wishlist/me
```

### Coupons

User route:

```text
POST /api/coupons/validate
```

Admin routes:

```text
POST   /api/coupons
GET    /api/coupons
PATCH  /api/coupons/:id
DELETE /api/coupons/:id
```

Example coupon validation request:

```json
{
  "code": "SAVE20",
  "amount": 500
}
```

### Payments

Authenticated routes:

```text
POST /api/payments/checkout/:courseId
GET  /api/payments
```

Paymob webhook:

```text
POST /api/payments/webhook
```

Example checkout request with an optional coupon:

```json
{
  "coupon": "SAVE20"
}
```

### Instructor Dashboard

Instructor/admin routes:

```text
GET /api/instructor/dashboard
GET /api/instructor/courses
GET /api/instructor/revenue
GET /api/instructor/enrollments
GET /api/instructor/top-courses
GET /api/instructor/courses/:courseId/analytics
```

Example filters:

```text
GET /api/instructor/courses?search=node&status=published&page=1&limit=10
GET /api/instructor/revenue?year=2026
GET /api/instructor/enrollments?year=2026
GET /api/instructor/top-courses?sortBy=revenue&limit=5
```

Admins may pass `instructorId` as a query parameter to view analytics for a specific instructor.

### Sections

```text
GET    /api/courses/:courseId/sections
POST   /api/courses/:courseId/sections
PATCH  /api/sections/:sectionId
DELETE /api/sections/:sectionId
```

Only the course instructor or an admin may create, update, or delete sections.

### Lessons

```text
GET    /api/sections/:sectionId/lessons
GET    /api/lessons/:lessonId
POST   /api/sections/:sectionId/lessons
PATCH  /api/lessons/:lessonId
DELETE /api/lessons/:lessonId
```

Only the course instructor or an admin may create, update, or delete lessons.

### Progress

```text
POST   /api/lessons/:lessonId/complete
DELETE /api/lessons/:lessonId/complete
GET    /api/lessons/:lessonId/complete/status
GET    /api/courses/:courseId/progress
```

### Certificates

```text
POST   /api/certificates/courses/:courseId
GET    /api/certificates/me
GET    /api/certificates/:certificateId
GET    /api/certificates/verify/:verificationCode
GET    /api/certificates
PATCH  /api/certificates/:certificateId/revoke
PATCH  /api/certificates/:certificateId/restore
```

## File Uploads

File upload requests must use:

```text
multipart/form-data
```

### Upload User Avatar

```text
PATCH /api/users/me/avatar
```

Field name:

```text
avatar
```

### Upload Course Cover Image

```text
POST  /api/courses
PATCH /api/courses/:courseId
```

Field name:

```text
coverImage
```

Course creation fields:

```text
title
description
price
category
status
coverImage
```

### Upload Course Gallery Images

```text
POST /api/courses/:courseId/gallery
```

Field name:

```text
gallery
```

Add multiple files using the same field name:

```text
gallery -> image-1.jpg
gallery -> image-2.jpg
gallery -> image-3.jpg
```

Maximum gallery size:

```text
10 images
```

Supported image types:

* JPG
* JPEG
* PNG
* WebP

Maximum file size:

```text
5 MB per image
```

### Upload Lesson Video

```text
POST /api/sections/:sectionId/lessons
PATCH /api/lessons/:lessonId
```

Field name:

```text
video
```

Supported video types

- mp4
- mov
- avi
- mkv
- webm

Do not manually add the `Content-Type` header in Postman. Postman automatically generates the correct multipart boundary.


## Project Structure

```text
coursehub-api/
├── src/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── categories.controller.js
│   │   ├── courses.controller.js
│   │   ├── enrollments.controller.js
│   │   ├── reviews.controller.js
│   │   ├── wishlist.controller.js
│   │   ├── certificates.controller.js
│   │   ├── coupons.controller.js
│   │   ├── payments.controller.js
│   │   ├── instructor.controller.js
│   │   ├── lessons.controller.js
│   │   ├── progress.controller.js
│   │   └── sections.controller.js
│   │
│   ├── helpers/
│   │   ├── category.helper.js
│   │   ├── cloudinary.helper.js
│   │   ├── course.helper.js
│   │   ├── coursePopulate.helper.js
│   │   ├── coupon.helper.js
│   │   ├── instructorAnalytics.helper.js
│   │   ├── payment.helper.js
│   │   ├── pagination.helper.js
│   │   ├── review.helper.js
│   │   ├── certificate.helper.js
│   │   ├── progress.helper.js
│   │   └── section.helper.js
│   │
│   ├── middleware/
│   │   ├── asyncWrapper.js
│   │   ├── auth.middleware.js
│   │   ├── authorize.middleware.js
│   │   ├── error.middleware.js
│   │   ├── notFound.middleware.js
│   │   ├── paymobHmac.middleware.js
│   │   ├── role.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validation.middleware.js
│   │
│   ├── models/
│   │   ├── user.model.js
│   │   ├── category.model.js
│   │   ├── course.model.js
│   │   ├── enrollment.model.js
│   │   ├── review.model.js
│   │   ├── wishlist.model.js
│   │   ├── certificate.model.js
│   │   ├── coupon.model.js
│   │   ├── payment.model.js
│   │   ├── lesson.model.js
│   │   ├── progress.model.js
│   │   └── section.model.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── categories.routes.js
│   │   ├── courses.routes.js
│   │   ├── enrollments.routes.js
│   │   ├── reviews.routes.js
│   │   ├── wishlist.routes.js
│   │   ├── certificates.routes.js
│   │   ├── coupons.routes.js
│   │   ├── payments.routes.js
│   │   ├── instructor.routes.js
│   │   ├── lessons.routes.js
│   │   ├── progress.routes.js
│   │   └── sections.routes.js
│   │
│   ├── utils/
│   │   ├── appError.js
│   │   ├── generateToken.js
│   │   ├── httpStatusText.js
│   │   ├── paymob.js
│   │   ├── paymobHmac.js
│   │   └── uploadToCloudinary.js
│   │
│   ├── validators/
│   │   ├── category.validator.js
│   │   ├── course.validator.js
│   │   ├── enrollment.validator.js
│   │   ├── gallery.validator.js
│   │   ├── review.validator.js
│   │   ├── wishlist.validator.js
│   │   ├── certificate.validator.js
│   │   ├── coupon.validator.js
│   │   ├── payment.validator.js
│   │   ├── lesson.validator.js
│   │   ├── progress.validator.js
│   │   └── section.validator.js
│   │
│   └── app.js
│
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Main Business Rules

* Passwords are stored as bcrypt hashes.
* Passwords are excluded from normal database queries.
* Users may only manage their own profiles.
* Admin-only routes require the `admin` role.
* Public registration accepts `user` and `instructor`; admins must be assigned by an admin.
* Courses must belong to an active category.
* Only the course instructor or admins may update or delete courses.
* Other instructors cannot manage courses they did not create.
* Only published courses accept new enrollments.
* Instructors cannot enroll in their own courses.
* A user cannot enroll in the same course twice.
* Only enrolled users may review a course.
* Instructors cannot review their own courses.
* A user may submit only one review per course.
* Course ratings are recalculated automatically after review changes.
- Only published courses can be added to a wishlist.
- Users cannot add the same course to their wishlist more than once.
- Users cannot add their own courses to their wishlist.
- Wishlist is available for all authenticated users.
- Coupons may be fixed amount or percentage based.
- Coupons can require a minimum amount, expire, be deactivated, and enforce a usage limit.
- A user cannot use the same coupon more than once.
- Checkout creates a pending Paymob payment.
- Successful Paymob webhook events mark payments as paid and create enrollments.
- Failed Paymob webhook events mark payments as failed.
- Courses contain ordered sections.
- Sections contain ordered lessons.
- Lessons may be preview or protected.
- Students must enroll before tracking progress.
- Completing every lesson marks the enrollment as completed.
- Only one completion record exists per lesson and student.
- Certificates are generated only after completing a course.
- Each student receives only one certificate per course.
- Certificates can be publicly verified.

## Security Notes

* Keep `.env` private.
* Never commit database credentials.
* Never commit Cloudinary API secrets.
* Never commit JWT secrets.
* Commit `.env.example` without real values.
* Do not commit `node_modules`.
* Rotate any credentials that are accidentally exposed.
* Use a strong JWT secret in production.
* Restrict CORS to trusted frontend domains in production.

## Planned Features

* Notifications
* Admin dashboard statistics
* Password reset flow
* Refresh tokens
* Email verification
* Swagger API documentation
* Unit and integration tests
* Docker support
* CI/CD pipeline

## License

This project is intended for learning, portfolio presentation, and backend development practice.
