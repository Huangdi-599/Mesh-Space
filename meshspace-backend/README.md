# MeshSpace Backend

A modern Node.js/Express/Mongoose backend for the MeshSpace social media app.

## Features
- JWT authentication (register, login, profile, email verification)
- User profiles with avatar upload
- Posts with images, reposts (with/without quote), trending/following feeds
- Threaded/nested comments with replies and mentions
- Real-time notifications (like, comment, reply, follow, repost, mention) via Socket.io
- RESTful API with type-safe controllers
- Cloudinary integration for image uploads

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
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_pass
```

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
- **Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-email`, `/api/auth/me`
- **User:** `/api/users/me`, `/api/users/:id`, `/api/users/:userId/follow`
- **Posts:** `/api/posts/` (create), `/api/posts/feed`, `/api/posts/:postId`, `/api/posts/:postId/comments`, `/api/posts/:postId/like`, `/api/posts/:postId/repost`, `/api/posts/search?q=...`
- **Notifications:** `/api/notifications/`

## Real-Time
- Socket.io is used for real-time notifications. The client connects with the user's ID as a query param.

## Project Structure
- `src/models/` - Mongoose models (User, Post, Comment, Notification)
- `src/controllers/` - Express route controllers
- `src/routes/` - API route definitions
- `src/middleware/` - Auth, upload, etc.
- `src/utils/` - Utility functions (token, socket, etc.)

## License
MIT 