# MeshSpace Frontend

A modern React (Vite + TypeScript + Tailwind + shadcn/ui) frontend for the MeshSpace social media app.

## Features
- Authentication (register, login, email verification, resend verification, forgot/reset password)
- User profiles with avatar upload/edit (Cloudinary, 2MB/image-only limit)
- Trending & following feeds, reposts (with/without quote)
- Threaded/nested comments with reply/mention support
- Real-time notifications (like, comment, reply, follow, repost, mention) via Socket.io
- Search for users and posts (fuzzy, multi-field)
- Clean, responsive UI with dark mode, skeletons, and beautiful cards
- Profile and post detail pages
- All user feedback (success/error) is shown via toast notifications

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Backend server running and accessible at the specified URL

### Installation
```bash
cd meshspace-frontend
npm install
```

### Environment Variables
Create a `.env` file in `meshspace-frontend/` if you need to override the backend URL:
```
VITE_BACKEND_URL=http://localhost:5100
```

### Running the App
```bash
npm run dev   # Start in development mode
npm run build # Build for production
npm run preview # Preview production build
```

### Scripts
- `dev`: Start Vite dev server
- `build`: Build for production
- `preview`: Preview production build
- `lint`: Run ESLint

## Project Structure
- `src/components/` - UI components (cards, navbar, post card, etc.)
- `src/pages/` - Page components (dashboard, profile, search, etc.)
- `src/context/` - React context (auth, notifications)
- `src/services/` - API service functions
- `src/hooks/` - Custom hooks (socket, auth)
- `src/lib/` - Axios config, utilities

## Real-Time
- Uses Socket.io for real-time notifications. Toasts show avatars and action buttons.

## Search
- Search bar in Navbar. Results page shows users and posts, with fuzzy, case-insensitive matching.

## UI/UX
- Built with shadcn/ui, Tailwind CSS, and Lucide icons
- Modern, responsive, and accessible
- Dark mode toggle in Navbar and Footer
- All user feedback (success/error) is shown via toast notifications
- Forgot/Reset password and resend verification flows are fully supported
- Profile edit supports avatar update (Cloudinary) and profile info
- All media uploads (avatars, post images) use Cloudinary and are limited to 2MB/image-only

## License
MIT
