# Backend Configuration & Security Middleware

This directory contains the production-ready CORS and security configuration for the CineBook API.

## Files

### `corsConfig.js`
Environment-aware CORS configuration that automatically adapts to development and production environments.

**Features:**
- ✅ Development: Allows all origins
- ✅ Production: Whitelist-based origin checking
- ✅ Multiple origin support (comma-separated)
- ✅ Credentials enabled for authentication
- ✅ Preflight caching (600 seconds)

**Usage:**
```javascript
const getCorsOptions = require('./corsConfig');
app.use(cors(getCorsOptions()));
```

### `securityHeaders.js`
Middleware that adds important security headers to all API responses.

**Security Headers Added:**
- `X-Frame-Options: DENY` - Clickjacking protection
- `X-Content-Type-Options: nosniff` - MIME sniffing prevention
- `X-XSS-Protection` - XSS attack prevention
- `Strict-Transport-Security` - HTTPS enforcement (production only)
- `Cache-Control` - Prevents caching sensitive data
- `Referrer-Policy` - Controls referrer information

**Usage:**
```javascript
const securityHeaders = require('./securityHeaders');
app.use(securityHeaders);
```

## Environment Variables

### Production Setup (Render Dashboard)

Set these environment variables in your Render service:

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=mongodb+srv://...

# Authentication
JWT_SECRET=generate-a-strong-random-string-here
JWT_EXPIRE=7d

# CORS - CRITICAL for production
CLIENT_URL=https://your-frontend-domain.com
```

### Multiple Frontend URLs

If you have staging and production frontends:
```env
CLIENT_URL=https://staging.vercel.app,https://production.vercel.app
```

## CORS Flow

```
Request from Frontend
  ↓
Browser sends OPTIONS preflight with Origin header
  ↓
corsConfig.js checks if Origin is in CLIENT_URL whitelist
  ↓
Production: Exact match required
Development: All origins allowed
  ↓
If allowed → 200 OK with CORS headers
If blocked → 403 Forbidden
  ↓
Browser allows actual request or blocks it
```

## Security Best Practices

1. **Always set CLIENT_URL** - Never rely on default in production
2. **Use HTTPS only** - Production sets HSTS headers
3. **Rotate JWT_SECRET regularly** - Don't hardcode, generate new
4. **Use MongoDB Atlas** - Don't expose local MongoDB
5. **Enable IP Whitelisting** - On MongoDB Atlas
6. **Monitor CORS blocks** - Check Render logs for rejected origins

## Testing

### Local Development
```bash
cd backend
npm run dev
```
- Visits both http://localhost:5173 and other origins
- All origins are allowed
- Check console logs for CORS activity

### Production Verification
```bash
# Test CORS preflight
curl -X OPTIONS https://your-api.onrender.com/api/auth/login \
  -H "Origin: https://your-frontend.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Should see 200 OK with Access-Control headers
```

## Troubleshooting

**CORS Blocked in Production?**
1. Verify `CLIENT_URL` is set on Render
2. Ensure it matches frontend domain exactly
3. Check for trailing slashes or http vs https
4. Wait 2-3 minutes for environment to apply
5. Clear browser cache

**Security Headers Not Applied?**
1. Check `securityHeaders.js` is loaded before routes
2. Verify order in `app.js`: securityHeaders → cors → routes
3. Restart server

See `CORS_TROUBLESHOOTING.md` for detailed debugging guide.

## Deployment Checklist

- [ ] `corsConfig.js` is in use in app.js
- [ ] `securityHeaders.js` is in use in app.js
- [ ] `NODE_ENV=production` set on Render
- [ ] `CLIENT_URL=your-frontend-domain` set on Render
- [ ] `JWT_SECRET` is changed to a strong random string
- [ ] `MONGO_URI` uses MongoDB Atlas
- [ ] All environment variables verified
- [ ] Test CORS preflight succeeds
- [ ] Frontend can login without CORS errors

---

For production deployment guide, see `PRODUCTION_DEPLOYMENT.md`
