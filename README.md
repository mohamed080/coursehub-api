# CourseHub API

A Node.js and Express REST API for authentication, user profile management, course management, MongoDB persistence, and Cloudinary image uploads.

## Features

- User registration, login, and JWT authentication
- Current-user profile, password, avatar, and account management
- Admin user listing, user lookup, role update, and deletion
- Course create, read, update, and delete endpoints
- Course image and user avatar uploads with Multer memory storage
- Cloudinary upload integration
- MongoDB models with Mongoose
- Centralized error handling and request validation

## Tech Stack

- Node.js
- Express
- MongoDB and Mongoose
- JWT
- bcryptjs
- Multer
- Cloudinary
- Helmet, CORS, Morgan

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Copy `.env.example` to `.env` and fill in your real values:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Required environment variables:

```env
NODE_ENV=development
PORT=3001
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
DEFAULT_USER_IMAGE=https://res.cloudinary.com/your-cloud/image/upload/default-user.png
```

### 3. Run the server

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

## API Routes

### Auth

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

### Courses

```text
GET    /api/courses
POST   /api/courses
GET    /api/courses/:courseId
PATCH  /api/courses/:courseId
DELETE /api/courses/:courseId
```

## File Uploads

Use `multipart/form-data`.

Avatar upload:

```text
PATCH /api/users/me/avatar
field name: avatar
```

Course image upload:

```text
POST  /api/courses
PATCH /api/courses/:courseId
field name: image
```

Supported image types:

- JPG
- JPEG
- PNG
- WebP

Maximum upload size: `5 MB`.

## Authentication

Protected routes require a bearer token:

```text
Authorization: Bearer <token>
```

The token is returned from the register and login endpoints.

## Project Structure

```text
src/
  app.js
  config/
  controllers/
  middleware/
  models/
  routes/
  utils/
  validators/
server.js
```

## Notes Before Pushing

- Keep `.env` private.
- Commit `.env.example` so other developers know which variables are required.
- Do not commit `node_modules`.
- Make sure MongoDB and Cloudinary credentials are configured before testing upload routes.
