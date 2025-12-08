# Message to Customer Portal Team - CSRF Cookie SameSite Issue

**Subject: CSRF Cookie Not Being Set/Sent - SameSite Restriction**

Hi Customer Portal Team,

We've updated our code to use the public booking endpoint (`/api/system/booking/public/bookings`), but we're still getting 403 "Ogiltig eller saknad CSRF-token".

**Current Status:**
- ✅ Using correct endpoint: `/api/system/booking/public/bookings`
- ✅ CSRF token fetched successfully from `/api/csrf-token`
- ✅ CSRF token included in `X-CSRF-Token` header
- ✅ Using `credentials: 'include'` in both requests
- ❌ **Cookies show "No cookies"** - CSRF cookie is not being set or sent

**Console Logs:**
```
🔐 Fetching CSRF token from: https://source-database-809785351172.europe-north1.run.app/api/csrf-token
🔐 CSRF token response status: 200
🔐 CSRF token response data: {csrfToken: 'OPuVZ5OZ-eQ0KxcQsYuKgKgmaecvKmcqVJMI'}
✅ CSRF token obtained: OPuVZ5OZ-eQ0KxcQsYuK...
📝 Creating booking with CSRF token: OPuVZ5OZ-eQ0KxcQsYuK...
📝 Booking request: {
  url: 'https://source-database-809785351172.europe-north1.run.app/api/system/booking/public/bookings',
  method: 'POST',
  headers: {...},
  hasCredentials: true,
  cookies: 'No cookies',  // ❌ This is the problem!
  hasCSRFCookie: false
}
POST /api/system/booking/public/bookings 403 (Forbidden)
❌ Booking failed: 403 {success: false, message: 'Ogiltig eller saknad CSRF-token'}
```

**The Issue:**

As you mentioned in your previous response, the CSRF cookie uses `SameSite: 'Strict'`, which blocks cross-origin cookies. Our frontend is making requests from a different origin than the API, so the CSRF cookie is not being set or sent.

**Request:**

Please update the CSRF cookie settings for the public booking endpoints to allow cross-origin requests:

1. **Update CSRF cookie for `/api/csrf-token` endpoint:**
   - Change `SameSite: 'Strict'` to `SameSite: 'None'`
   - Ensure `Secure: true` is set (required for `SameSite: 'None'`)
   - This will allow the cookie to be set and sent from cross-origin requests

2. **Verify cookie attributes:**
   - Cookie names: `csrfToken` and/or `XSRF-TOKEN`
   - `SameSite: 'None'`
   - `Secure: true`
   - Appropriate `Domain` and `Path` settings

**Our Frontend Details:**
- Frontend origin: (please check - we're making requests from a different domain)
- We're using HTTPS
- We're including `credentials: 'include'` in all requests

**Expected Behavior After Fix:**

After you update the CSRF cookie settings, when we:
1. Fetch CSRF token from `/api/csrf-token` → Cookie should be set
2. Make booking request to `/api/system/booking/public/bookings` → Cookie should be sent automatically with `credentials: 'include'`
3. Server should validate both the `X-CSRF-Token` header AND the cookie

**Alternative Solution:**

If updating the CSRF cookie settings is not possible, could you:
- Make the public booking endpoint (`/api/system/booking/public/bookings`) not require CSRF validation?
- Or provide a different authentication method for public bookings?

Thank you for your help!

Best regards

