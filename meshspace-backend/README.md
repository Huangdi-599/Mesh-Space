# MeshSpace Backend

A modern Node.js/Express/Mongoose backend for the MeshSpace social media app.

## Features
- JWT authentication (register, login, profile, email verification, resend verification, forgot/reset password)
- User profiles with avatar upload (Cloudinary, 2MB/image-only limit)
- Posts with images (Cloudinary, 2MB/image-only limit), reposts (with/without quote), trending/following feeds
- Threaded/nested comments with replies and mentions
- Real-time notifications (like, comment, reply, follow, repost, mention) via Socket.io
- RESTful API with type-safe controllers
- Cloudinary integration for all media uploads (avatars, post images)
- Email service for verification, password reset, and notifications (robust error handling/logging)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB

### Installation
```bash
cd meshspace-backend
npm install
```

### Environment Variables
Create a `.env` file in `meshspace-backend/` with:
```
PORT=5100
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=your_smtp_host
EMAIL_PORT=your_smtp_port
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_pass
```
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` must be set to a real SMTP provider (e.g., Gmail, Mailgun, SendGrid, Mailtrap, etc.).

### Running the Server
```bash
npm run dev   # Start in development mode (with nodemon)
npm start     # Start in production mode
```

### Scripts
- `dev`: Start with nodemon
- `start`: Start normally
- `lint`: Run ESLint

## API Overview
- **Auth:**
  - `POST /api/auth/register` (register, avatar upload via Cloudinary)
  - `POST /api/auth/login`
  - `POST /api/auth/verify-email` (verify email with token)
  - `POST /api/auth/forgot-password` (request password reset)
  - `POST /api/auth/reset-password` (reset password with token)
  - `POST /api/auth/resend-verification` (resend verification email)
- **User:**
  - `GET /api/user/me` (get current user)
  - `PUT /api/user/me` (update profile, avatar upload via Cloudinary)
  - `GET /api/user/:id` (get user by ID)
  - `POST /api/user/:userId/follow` (follow/unfollow)
  - `GET /api/user/:userId/followers` / `following`
- **Posts:**
  - `POST /api/posts/` (create post, image upload via Cloudinary)
  - `GET /api/posts/feed` (trending/following)
  - `GET /api/posts/:postId` (post detail)
  - `POST /api/posts/:postId/comments` (add comment/reply)
  - `POST /api/posts/:postId/like` (like/unlike)
  - `POST /api/posts/:postId/repost` (repost)
  - `GET /api/posts/search?q=...` (search posts)
- **Notifications:**
  - `GET /api/notifications/` (fetch notifications)

## Real-Time
- Socket.io is used for real-time notifications. The client connects with the user's ID as a query param.

## File Uploads
- All media (avatars, post images) are uploaded to Cloudinary.
- File size limit: 2MB. Only image files (`image/*`) are accepted.
- Backend enforces these limits and returns errors if exceeded.

## Email Service
- All verification, password reset, and notification emails are sent via SMTP.
- Errors in email sending are logged but do not block registration or password reset (users can always request again).
- See `.env` for required SMTP config.

## CORS & Frontend Integration
- The backend expects requests from the frontend at `CLIENT_URL` (set in `.env`).
- CORS is enabled for this origin.

## Project Structure
- `src/models/` - Mongoose models (User, Post, Comment, Notification)
- `src/controllers/` - Express route controllers
- `src/routes/` - API route definitions
- `src/middleware/` - Auth, upload, etc.
- `src/utils/` - Utility functions (token, socket, etc.)

## License
MIT 