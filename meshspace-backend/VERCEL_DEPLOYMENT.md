# Vercel Deployment Guide for MeshSpace Backend

## 🚀 Quick Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Backend Directory
```bash
cd meshspace-backend
vercel
```

### 4. Set Environment Variables
Go to your Vercel dashboard → Project Settings → Environment Variables and add:

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

### 5. Redeploy
```bash
vercel --prod
```

## 🔧 Configuration Files

### vercel.json
```json
{
    "version": 2,
    "builds": [
        {
            "src": "dist/server.js",
            "use": "@vercel/node"
        }
    ],
    "routes": [
        {
            "src": "/(.*)",
            "dest": "dist/server.js"
        }
    ]
}
```

### package.json Scripts
```json
{
  "scripts": {
    "dev": "ts-node-dev src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "start:dev": "nodemon dist/server.js",
    "vercel-build": "npm run build"
  }
}
```

## 🌐 What You'll See

After successful deployment, visit your Vercel URL to see:
- ✅ Beautiful health check UI
- 📋 Complete API endpoint list
- ⚙️ Environment information
- 🚀 Server status

## 🔍 Troubleshooting

### Common Issues:

1. **404 Error**: 
   - Check vercel.json configuration
   - Ensure build completed successfully
   - Verify routes are pointing to correct file

2. **Build Fails**:
   - Run `npm run build` locally first
   - Check TypeScript compilation errors
   - Ensure all dependencies are in package.json

3. **Environment Variables Not Working**:
   - Set them in Vercel dashboard
   - Redeploy after setting variables
   - Check variable names match exactly

4. **MongoDB Connection Issues**:
   - Verify MONGO_URI is correct
   - Check if IP is whitelisted in MongoDB Atlas
   - Ensure cluster is accessible

### Debug Commands:
```bash
# Test build locally
npm run build

# Test server locally
npm start

# Check Vercel logs
vercel logs

# Redeploy
vercel --prod
```

## 📱 API Endpoints

Your deployed API will be available at:
- `https://your-project.vercel.app/` - Health check UI
- `https://your-project.vercel.app/api/health` - Health check API
- `https://your-project.vercel.app/api/auth/*` - Authentication
- `https://your-project.vercel.app/api/user/*` - User management
- `https://your-project.vercel.app/api/posts/*` - Posts
- `https://your-project.vercel.app/api/notifications/*` - Notifications

## 🎯 Next Steps

1. Deploy your frontend to Vercel
2. Update CLIENT_URL in backend environment variables
3. Test the full application
4. Set up custom domain (optional)

## 📝 Notes

- Vercel uses serverless functions
- WebSocket connections may have limitations
- File uploads work with Cloudinary integration
- Email service requires proper SMTP configuration
