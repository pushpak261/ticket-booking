# CORS Troubleshooting Guide

## Quick Diagnosis

### Step 1: Check Browser Console
```
❌ Access to XMLHttpRequest blocked by CORS policy
```
→ Go to **Section: CORS Blocked** below

---

## Common CORS Errors

### Error 1: "Access to XMLHttpRequest blocked by CORS policy"

**What it means:** Backend rejected the request because frontend domain isn't allowed

**Root Causes:**
1. `CLIENT_URL` not set on backend
2. Frontend domain doesn't match `CLIENT_URL`
3. Backend not restarted after env changes

**Fix:**
```bash
# Step 1: Check what frontend URL you're using
# (Copy from browser address bar, e.g., https://your-app.vercel.app)

# Step 2: On Render Dashboard
# Backend Service → Settings → Environment → CLIENT_URL
# Set to: https://your-app.vercel.app

# Step 3: Redeploy or restart backend
# (Changes to env vars trigger auto-restart on Render)

# Step 4: Test again in frontend
```

---

### Error 2: "Response to preflight request doesn't pass access control check"

**Symptoms:**
- Only happens on POST/PUT/DELETE requests
- OPTIONS request returns 403 or 404
- Works on simple GET requests

**Root Cause:** CORS preflight failed

**Fix:**
```bash
# Test CORS preflight manually:
curl -X OPTIONS https://your-backend.onrender.com/api/auth/login \
  -H "Origin: https://your-app.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v

# You should see:
# HTTP/1.1 200 OK
# access-control-allow-origin: https://your-app.vercel.app
# access-control-allow-methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

---

### Error 3: "Credentials mode is 'include' but 'Access-Control-Allow-Credentials' is missing"

**Symptoms:**
- Login fails even after fixing CORS origin
- JWT tokens not being sent

**Root Cause:** Credentials not enabled in CORS

**Fix:**
✅ Already fixed in our code: `credentials: true` in `corsConfig.js`

If this error occurs:
1. Clear browser cookies: DevTools → Application → Cookies → Delete all
2. Clear localStorage: `localStorage.clear()` in console
3. Try login again

---

### Error 4: CORS works locally but fails in production

**Symptoms:**
- Works when running locally (npm run dev)
- Fails after deployment to Vercel/Netlify

**Root Causes:**
1. `VITE_BACKEND_URL` not set in production
2. Frontend points to wrong backend URL
3. Backend CORS still references localhost

**Fix:**
```bash
# Frontend (.env.production)
VITE_BACKEND_URL=https://your-backend-domain.onrender.com/api

# Backend (Render Environment Variables)
CLIENT_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production

# Then redeploy both frontend and backend
```

---

## Testing Checklist

### Local Development
- [ ] `npm run dev` starts on http://localhost:5173
- [ ] Backend runs on http://localhost:5000
- [ ] Login/register works
- [ ] API calls complete without CORS errors
- [ ] DevTools Network tab shows requests succeeding

### Production Deployment

**1. Backend Health Check:**
```bash
curl https://your-backend.onrender.com/api/health
```
Expected response:
```json
{
  "success": true,
  "message": "CineBook API is running",
  "environment": "production"
}
```

**2. CORS Preflight Test:**
```bash
curl -X OPTIONS https://your-backend.onrender.com/api/auth/login \
  -H "Origin: https://your-frontend-domain.vercel.app" \
  -v
```
Expected headers in response:
```
access-control-allow-origin: https://your-frontend-domain.vercel.app
access-control-allow-credentials: true
access-control-allow-methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
```

**3. Actual API Test:**
```bash
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Origin: https://your-frontend-domain.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

**4. Login in Browser:**
- Go to https://your-frontend-domain.vercel.app
- Open DevTools → Network tab
- Try login
- Check for CORS errors
- Verify successful 200/201 response

---

## Advanced Debugging

### Enable Debug Logs

**Backend:**
Add to server startup (temporary):
```bash
# Terminal
NODE_DEBUG=* npm start
```

**Frontend:**
In axios.js, add interceptors:
```javascript
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.url, config);
    return config;
  }
);
```

### Check Network Headers

In browser DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Make a request (click login)
4. Click on the request
5. Check:
   - **Request Headers:** `Origin` should be your frontend URL
   - **Response Headers:** Should have `access-control-allow-origin`

### Browser Console Errors

- `Access to XMLHttpRequest blocked by CORS policy` → Origin not whitelisted
- `SyntaxError: Unexpected token < in JSON at position 0` → Backend returned HTML error page
- `TypeError: Failed to fetch` → Network error or server offline

---

## Configuration Files Summary

### Backend Files
- `src/middleware/corsConfig.js` - CORS rules per environment
- `src/middleware/securityHeaders.js` - Security headers
- `src/app.js` - Integrated middleware
- `.env.example` - Environment template
- `.env.production` - Production example (don't commit)

### Frontend Files
- `src/api/axios.js` - Axios with dynamic base URL
- `.env.development` - Local backend proxy
- `.env.production` - Production backend URL
- `vite.config.js` - Dev server proxy

---

## Environment Variables Reference

### Backend (Set on Render Dashboard)

```env
# Must match your frontend domain exactly
CLIENT_URL=https://your-app.vercel.app

# For staging + production
CLIENT_URL=https://staging.vercel.app,https://your-app.vercel.app

# Set to production
NODE_ENV=production
```

### Frontend (Deploy environment variables)

```env
# Must match your backend domain exactly
VITE_BACKEND_URL=https://your-backend.onrender.com/api
```

---

## Quick Fix Flowchart

```
CORS Error?
├─ LOCAL (npm run dev)
│  ├─ Backend running on 5000? → Start backend
│  ├─ Frontend on 5173? → Check vite.config.js proxy
│  └─ Check browser console
│
└─ PRODUCTION
   ├─ Check CLIENT_URL on Render
   ├─ Check VITE_BACKEND_URL on Vercel/Netlify
   ├─ Wait 2-3 mins for env to apply
   ├─ Redeploy frontend
   └─ Clear browser cache (Ctrl+Shift+Delete)
```

---

## Still Having Issues?

### Information to Gather

1. **Frontend URL:** (from browser address bar)
   ```
   https://...
   ```

2. **Backend URL:** (from Render dashboard)
   ```
   https://...
   ```

3. **Error Message:** (from browser console)
   ```
   ...
   ```

4. **Environment Variables Set on Render:**
   - `CLIENT_URL` = ?
   - `NODE_ENV` = ?
   - `MONGO_URI` = ?

5. **Test CORS Preflight:**
   ```bash
   curl -v -X OPTIONS [BACKEND_URL]/api/auth/login \
     -H "Origin: [FRONTEND_URL]"
   ```

### Additional Help

- Check Render logs: Dashboard → Backend → Logs
- Verify MongoDB connection: Check `/api/health` endpoint
- Clear browser cache: Ctrl+Shift+Delete
- Try incognito/private window
- Test from different network (not your current WiFi)
