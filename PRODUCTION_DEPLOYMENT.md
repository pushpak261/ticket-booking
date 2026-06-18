# Production Deployment Guide - CORS & Security Configuration

## Overview
This guide covers all CORS and security configuration needed for deploying the CineBook application to production.

---

## 1. Backend Configuration (Render/Node.js)

### Environment Variables (Must Set on Render Dashboard)

**Settings → Environment Variables**

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cinebook?retryWrites=true&w=majority

# JWT (IMPORTANT: Change to a strong random string)
JWT_SECRET=generate_a_strong_random_secret_key_here
JWT_EXPIRE=7d

# CORS - Frontend URL(s)
CLIENT_URL=https://your-frontend-domain.com
```

### Setting CLIENT_URL for Different Scenarios

**Single Frontend URL:**
```env
CLIENT_URL=https://your-app.vercel.app
```

**Multiple Frontend URLs (for staging + production):**
```env
CLIENT_URL=https://your-app.vercel.app,https://staging.vercel.app
```

**Local Development + Deployed:**
```env
CLIENT_URL=http://localhost:5173,https://your-app.vercel.app
```

---

## 2. Frontend Configuration

### Environment Files

**`.env.production` (Deployed URL)**
```env
VITE_BACKEND_URL=https://ticket-booking-o7co.onrender.com/api
```

**`.env.development` (Local Development)**
```env
VITE_BACKEND_URL=/api
```

### Vite Config (Development Proxy)
- ✅ Already configured in `vite.config.js`
- Routes `/api` to `http://localhost:5000` in development
- Works seamlessly with backend

---

## 3. CORS Flow Diagram

```
Frontend (https://your-app.vercel.app)
    ↓
OPTIONS request with Origin header
    ↓
Backend CORS Middleware (corsConfig.js)
    ↓
Checks if Origin matches CLIENT_URL
    ↓
If match → Allow (200 OK)
If no match → Block (403 CORS Error)
    ↓
Makes actual request
```

---

## 4. Security Features Implemented

### CORS Middleware (`src/middleware/corsConfig.js`)
- ✅ Whitelist-based origin checking in production
- ✅ Multiple origin support (comma-separated)
- ✅ Credentials enabled for cookies/auth tokens
- ✅ Custom HTTP methods allowed (GET, POST, PUT, DELETE, PATCH)
- ✅ Request caching for preflight (600 seconds)

### Security Headers (`src/middleware/securityHeaders.js`)
- ✅ `X-Frame-Options: DENY` - Prevents clickjacking
- ✅ `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- ✅ `X-XSS-Protection` - XSS attack prevention
- ✅ `Strict-Transport-Security` - HTTPS enforcement (production only)
- ✅ `Cache-Control: no-store` - Prevents caching of sensitive data
- ✅ `Referrer-Policy` - Controls referrer information

---

## 5. Deployment Checklist

### Backend (Render)

- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set all environment variables (see Section 1)
- [ ] Verify `NODE_ENV=production`
- [ ] Test health check: `https://your-backend.onrender.com/api/health`

### Frontend (Vercel/Netlify)

- [ ] Deploy to Vercel or Netlify
- [ ] Set `VITE_BACKEND_URL` environment variable
- [ ] Verify build succeeds
- [ ] Test API calls work

### Verification Steps

1. **Test CORS Preflight:**
   ```bash
   curl -X OPTIONS https://your-backend.onrender.com/api/auth/login \
     -H "Origin: https://your-app.vercel.app" \
     -H "Access-Control-Request-Method: POST"
   ```

2. **Check Health Endpoint:**
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```

3. **Test Auth Request:**
   - Go to your deployed frontend
   - Try login/registration
   - Check browser DevTools → Network tab
   - Verify no CORS errors

---

## 6. Common CORS Issues & Fixes

### Issue: "Access to XMLHttpRequest blocked by CORS policy"

**Cause:** Frontend URL not in `CLIENT_URL`

**Fix:**
1. Go to Render Dashboard → Backend Service → Settings
2. Find `CLIENT_URL` environment variable
3. Add your frontend URL: `https://your-app.vercel.app`
4. Redeploy or just save (backend restarts)

### Issue: "OPTIONS 404 Not Found"

**Cause:** CORS preflight request not being handled

**Fix:**
- ✅ Already fixed in our setup (Express CORS middleware handles it)
- Ensure `app.use(cors(getCorsOptions()))` is before route definitions

### Issue: "Credentials mode is 'include' but Access-Control-Allow-Credentials is missing"

**Cause:** Missing credentials in CORS configuration

**Fix:**
- ✅ Already configured: `credentials: true` in corsConfig.js

---

## 7. Production Best Practices

### Security
- ✅ Use HTTPS only (`NODE_ENV=production` enables HSTS)
- ✅ Set strong `JWT_SECRET` (min 32 characters)
- ✅ Use MongoDB Atlas with IP whitelisting
- ✅ Enable connection pooling on MongoDB

### Performance
- ✅ CORS preflight responses cached (600 seconds)
- ✅ Morgan logging disabled in production
- ✅ Error details not exposed to clients

### Monitoring
- Check Render logs for CORS block messages
- Monitor authentication failure rates
- Set up MongoDB alerts

---

## 8. Environment Variable Summary

| Variable | Production Value | Development Value |
|----------|-----------------|------------------|
| `NODE_ENV` | `production` | `development` |
| `PORT` | `5000` | `5000` |
| `CLIENT_URL` | `https://your-app.vercel.app` | `http://localhost:5173` |
| `MONGO_URI` | MongoDB Atlas URI | `mongodb://localhost:27017/cinebook` |
| `JWT_SECRET` | Strong random string | Test secret (can be simple) |
| `VITE_BACKEND_URL` (Frontend) | `https://backend.onrender.com/api` | `/api` |

---

## 9. Quick Start Deployment

### Step 1: Update Backend Variables on Render
```
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_strong_secret_key
```

### Step 2: Update Frontend .env.production
```env
VITE_BACKEND_URL=https://your-backend-domain.onrender.com/api
```

### Step 3: Push to GitHub
```bash
git add .
git commit -m "Configure production deployment"
git push origin main
```

### Step 4: Verify Deployment
- Frontend builds successfully
- Backend health check responds
- Login/auth works without CORS errors

---

## 10. File References

**Backend CORS Files:**
- `backend/src/middleware/corsConfig.js` - Environment-aware CORS rules
- `backend/src/middleware/securityHeaders.js` - Security headers
- `backend/src/app.js` - Integrated middleware
- `backend/.env.example` - Environment template

**Frontend Config:**
- `frontend/.env.production` - Production backend URL
- `frontend/.env.development` - Development backend URL
- `frontend/src/api/axios.js` - Axios with dynamic base URL
- `frontend/vite.config.js` - Development proxy setup

---

## Support

For CORS or deployment issues:
1. Check [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
2. Review browser DevTools → Network → Response Headers
3. Check backend logs on Render Dashboard
4. Verify all environment variables are set correctly
