# MongoDB Connection Setup & Troubleshooting Guide

## Current Status
- **Error Fixed**: Added retry logic with exponential backoff
- **Connection Timeout**: 5 seconds with automatic retries (5 attempts)
- **Connection Pooling**: Configured for optimal performance

---

## ✅ Quick Fix Checklist

### 1. **MongoDB Atlas Cluster Setup**
```
1. Go to: https://cloud.mongodb.com/
2. Sign in to your account
3. Navigate to: Clusters > Your Cluster (cluster0)
4. Check Status: Should be "Running" (not "Paused")
   - If Paused → Click "Resume"
```

### 2. **Whitelist Your IP Address** ⭐ MOST IMPORTANT
```
1. In MongoDB Atlas Dashboard:
   - Left Sidebar → Network Access
   - Click "Add IP Address" button
   - Choose ONE option:
     
     Option A (Development - Easiest):
     - Click "Allow Access from Anywhere"
     - Sets IP to: 0.0.0.0/0
     
     Option B (Production - Secure):
     - Paste your current IP address
     - Find your IP: https://whatismyipaddress.com
```

### 3. **Verify Credentials**
Your current MONGO_URI (from .env):
```
mongodb+srv://pushpakrajendra_db_user:wBlkZUsdN8kgvDcm@cluster0.qckx1kj.mongodb.net/cinebook?retryWrites=true&w=majority
```

Check that:
- Username: `pushpakrajendra_db_user` ✓
- Database: `cinebook` ✓
- Cluster: `cluster0.qckx1kj.mongodb.net` ✓

---

## 🔧 Troubleshooting Steps

### Problem: ECONNREFUSED querySrv

**Solution:**
```bash
# 1. Check Network Status
ping 8.8.8.8  # Verify internet connection

# 2. Restart Backend Server
cd backend
npm start

# 3. If still fails:
#    - MongoDB Atlas > Network Access > Whitelist Your IP
#    - Wait 1-2 minutes for changes to apply
#    - Restart server again
```

### Problem: ENOTFOUND (DNS Resolution Issue)

**Solution:**
```bash
# Add DNS and ensure connection string is correct
# Your MONGO_URI should contain: _mongodb._tcp.cluster0.qckx1kj.mongodb.net
```

### Problem: Invalid Credentials (Authentication Failed)

**Solution:**
```bash
# 1. Go to MongoDB Atlas
# 2. Click your Cluster → Connect Button
# 3. Click "Drivers" tab
# 4. Copy the exact connection string
# 5. Replace password if forgotten:
#    - Database Access → Edit User → Change Password
```

---

## 🌍 Connection Options Explained

The updated `db.js` includes these optimizations:

```javascript
{
  maxPoolSize: 10,              // Max concurrent connections
  minPoolSize: 5,               // Min persistent connections
  serverSelectionTimeoutMS: 5000, // How long to wait for server
  socketTimeoutMS: 45000,       // Socket idle timeout
  connectTimeoutMS: 10000,      // Connection attempt timeout
  retryWrites: true,            // Automatically retry failed writes
  retryReads: true,             // Automatically retry failed reads
  w: 'majority',                // Write acknowledgment from majority
}
```

---

## 🚀 Testing the Connection

### Test 1: Run Backend
```bash
cd backend
npm start

# Expected Output:
# 🔄 MongoDB Connection Attempt 1/5...
# ✅ MongoDB Connected Successfully!
#    Host: cluster0.qckx1kj.mongodb.net
#    Database: cinebook
#    State: Connected
```

### Test 2: Health Check API
```bash
# In another terminal:
curl http://localhost:5000/api/health

# Expected Response:
# {
#   "success": true,
#   "message": "CineBook API is running",
#   "timestamp": "2026-06-18T...",
#   "environment": "development"
# }
```

### Test 3: Frontend Connection
```bash
cd frontend
npm run dev

# Should connect to backend without CORS errors
```

---

## 📋 Environment Variables

Current `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://pushpakrajendra_db_user:wBlkZUsdN8kgvDcm@cluster0.qckx1kj.mongodb.net/cinebook?retryWrites=true&w=majority
JWT_SECRET=cinebook_jwt_secret_key_2024
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

**For Production**, change:
```env
PORT=5000  # Use port 80 or 443
NODE_ENV=production
JWT_SECRET=use_a_strong_random_string_with_32_chars
CLIENT_URL=https://your-production-domain.com
```

---

## 🔄 Automatic Retry Logic

The connection now has built-in retry logic:
- **Attempt 1**: Immediate (0 seconds)
- **Attempt 2**: 2 seconds delay
- **Attempt 3**: 4 seconds delay
- **Attempt 4**: 8 seconds delay
- **Attempt 5**: 16 seconds delay

This helps with temporary network issues and cluster startup delays.

---

## 📞 Still Having Issues?

1. **Check MongoDB Atlas Cluster Status**
   - https://cloud.mongodb.com/ → Clusters
   - Look for green checkmark (Running)

2. **Monitor Connection Events**
   - Server logs now show: disconnected, reconnected, errors

3. **Verify Firewall Settings**
   - Some corporate networks block MongoDB (port 27017)
   - Contact your network administrator if needed

4. **Check Connection String Format**
   ```
   mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE
   mongodb+srv://pushpakrajendra_db_user:wBlkZUsdN8kgvDcm@cluster0.qckx1kj.mongodb.net/cinebook
   ```

5. **Use Compass for Manual Testing**
   - Download: https://www.mongodb.com/products/compass
   - Paste MONGO_URI from .env
   - Test connection manually

---

## ✨ What Changed

### Updated Files:
1. **backend/src/config/db.js**
   - Added retry logic with exponential backoff
   - Improved error messages with actionable steps
   - Connection event monitoring
   - Proper connection pooling configuration

2. **backend/server.js**
   - Better error handling
   - Graceful shutdown
   - Improved logging

---

## 🎯 Next Steps

1. ✅ Whitelist your IP in MongoDB Atlas (0.0.0.0/0 for dev)
2. ✅ Ensure cluster is Running (not Paused)
3. ✅ Run `npm start` in backend folder
4. ✅ Verify successful connection message
5. ✅ Test `/api/health` endpoint
6. ✅ Start frontend with `npm run dev`

Your MongoDB connection should now work permanently! 🎉
