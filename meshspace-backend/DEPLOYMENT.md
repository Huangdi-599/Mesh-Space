# Vercel Deployment Guide for MeshSpace Backend

## Prerequisites
1. Vercel account (sign up at [vercel.com](https://vercel.com))
2. Vercel CLI installed: `npm i -g vercel`
3. MongoDB Atlas account and cluster
4. Cloudinary account for media storage
5. SMTP email service (Gmail, SendGrid, etc.)

## Environment Variables
Set these in your Vercel project dashboard under Settings > Environment Variables:

### Required Variables
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/meshspace
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=https://your-frontend-domain.vercel.app
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

## Deployment Steps

### 1. Build the Project
```bash
cd meshspace-backend
npm run build
```

### 2. Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy (first time)
vercel

# For subsequent deployments
vercel --prod
```

### 3. Set Environment Variables
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all the required variables listed above

### 4. Redeploy
After setting environment variables, redeploy:
```bash
vercel --prod
```

## Project Structure for Vercel
```
meshspace-backend/
├── api/
│   └── index.js          # Vercel serverless entry point
├── dist/                 # Compiled TypeScript (generated)
├── src/                  # Source TypeScript files
├── vercel.json          # Vercel configuration
├── .vercelignore        # Files to ignore in deployment
└── package.json         # Dependencies and scripts
```

## Health Check
Once deployed, visit your Vercel URL to see the beautiful health check UI showing:
- Server status
- Available API endpoints
- Environment information
- Timestamp

## API Endpoints
Your deployed API will be available at:
- `https://your-project.vercel.app/api/auth/*`
- `https://your-project.vercel.app/api/user/*`
- `https://your-project.vercel.app/api/posts/*`
- `https://your-project.vercel.app/api/notifications/*`

## Troubleshooting

### Common Issues
1. **Build fails**: Check TypeScript compilation with `npm run build`
2. **Environment variables not working**: Ensure they're set in Vercel dashboard
3. **Database connection fails**: Verify MONGO_URI is correct
4. **CORS errors**: Update CLIENT_URL to match your frontend domain

### Logs
Check Vercel function logs in the dashboard under Functions tab.

## Local Development
```bash
npm run dev  # Start development server
npm run build  # Build for production
npm start  # Start production build locally
```

## Notes
- Vercel uses serverless functions, so some features like persistent WebSocket connections may not work as expected
- Consider using Vercel's WebSocket support or external services for real-time features
- File uploads work with Cloudinary integration
- Email service requires proper SMTP configuration
