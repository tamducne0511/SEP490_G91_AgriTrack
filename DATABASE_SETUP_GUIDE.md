# Database Setup Guide

## Issue: Database data not showing in app

### Root Cause Analysis

The app is currently using **mock data by default** instead of real database data. Here are the potential issues:

### 1. **Mock Data Toggle is ON by Default**
- Location: `client/src/stores/newsStore.js`
- Issue: `useMockData: true` (line 171)
- **Solution**: Toggle the switch in the UI or change default to `false`

### 2. **Missing Environment Variables**
- Location: `client/.env` (file doesn't exist)
- Issue: `REACT_APP_API_BASE_URL` not set
- **Solution**: Create `.env` file with proper API URL

### 3. **Database Connection Issues**
- Location: `server/configs/db.js`
- Issue: `MONGODB_URI` environment variable not set
- **Solution**: Set up MongoDB connection string

## Quick Fixes

### Fix 1: Toggle Mock Data OFF
1. Open the app in browser
2. Go to News page
3. Toggle "Dữ liệu mẫu" switch to OFF
4. Check console for API calls

### Fix 2: Create Environment Files

#### Client Environment (`client/.env`)
```env
REACT_APP_API_BASE_URL=http://localhost:5000
NODE_ENV=development
```

#### Server Environment (`server/.env`)
```env
MONGODB_URI=mongodb://localhost:27017/agritrack
PORT=5000
JWT_SECRET=your_jwt_secret_here
```

### Fix 3: Check Database Connection
1. Ensure MongoDB is running
2. Check server console for "✅ MongoDB connected"
3. Verify database has news data

## Debug Steps

### Step 1: Check Current Mode
```javascript
// In browser console
console.log("Current mode:", useNewsStore.getState().useMockData);
```

### Step 2: Check API Configuration
```javascript
// In browser console
console.log("API Base URL:", process.env.REACT_APP_API_BASE_URL);
```

### Step 3: Check Server Logs
Look for these logs in server console:
- `🔍 [NewsService] Starting findAll...`
- `📊 [NewsService] Query results:`
- `📰 [NewsService] News data:`

### Step 4: Check Network Tab
1. Open Developer Tools → Network
2. Toggle mock data OFF
3. Look for API calls to `/admin/news`
4. Check response data

## Expected Behavior

### With Mock Data ON:
- Shows 6 sample Vietnamese news articles
- No API calls in Network tab
- Console shows: `🔧 [NewsStore] Using mock data: true`

### With Mock Data OFF:
- Makes API calls to backend
- Shows real database data
- Console shows: `🌐 [NewsStore] Using real API...`

## Troubleshooting

### If API calls fail:
1. Check if server is running on port 5000
2. Verify CORS configuration
3. Check authentication token

### If database is empty:
1. Create some test news via the form
2. Check MongoDB directly
3. Verify news collection exists

### If still showing mock data:
1. Clear browser cache
2. Restart both client and server
3. Check environment variables are loaded
