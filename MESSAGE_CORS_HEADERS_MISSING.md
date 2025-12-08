# Message to Customer Portal Team - CORS Headers Missing

**Subject: CORS Headers Missing - Cookies Not Being Sent**

Hi Customer Portal Team,

We've identified the issue: **CORS headers are not being returned by the server**, which is preventing cookies from being sent with cross-origin requests.

**Test Results:**

We tested the CORS headers using an OPTIONS request:

```javascript
fetch('https://source-database-809785351172.europe-north1.run.app/api/system/booking/public/bookings', {
  method: 'OPTIONS',
  credentials: 'include'
})
.then(r => {
  console.log('CORS headers:', {
    'Access-Control-Allow-Origin': r.headers.get('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Credentials': r.headers.get('Access-Control-Allow-Credentials')
  });
});
```

**Result:**
```
CORS headers: {
  Access-Control-Allow-Origin: null,
  Access-Control-Allow-Credentials: null
}
```

**The Problem:**

The server is not returning CORS headers (`Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials`), which means:
1. The browser blocks cookies from being sent (security policy)
2. Cross-origin requests with credentials fail
3. CSRF cookies cannot be transmitted

**What's Needed:**

The `/api/system/booking/public/bookings` endpoint needs to return:

1. **For OPTIONS (preflight) requests:**
   ```
   Access-Control-Allow-Origin: <frontend-origin>
   Access-Control-Allow-Credentials: true
   Access-Control-Allow-Methods: POST, OPTIONS
   Access-Control-Allow-Headers: Content-Type, X-CSRF-Token, X-Tenant
   ```

2. **For POST requests:**
   ```
   Access-Control-Allow-Origin: <frontend-origin>
   Access-Control-Allow-Credentials: true
   ```

**Frontend Origin:**

Please check the Network tab in DevTools to see the exact `Origin` header being sent. It should be visible in:
- The `Origin` header in the request
- The `Referer` header

**Request:**

Please:
1. Add CORS headers to the `/api/system/booking/public/bookings` endpoint
2. Ensure `Access-Control-Allow-Credentials: true` is set
3. Whitelist our frontend origin (we'll provide the exact origin once we check the Network tab)
4. Verify that cookies can be sent with cross-origin requests

**Why This Matters:**

Without proper CORS headers:
- Cookies cannot be sent (browser security blocks them)
- CSRF validation fails (no cookie = no validation)
- Booking requests return 403

With proper CORS headers:
- Cookies will be sent automatically with `credentials: 'include'`
- CSRF validation will work
- Booking requests will succeed

**Next Steps:**

Once CORS headers are added, we'll:
1. Verify cookies are being sent (check Network tab)
2. Test booking creation
3. Confirm everything works

Thank you for your help!

Best regards

