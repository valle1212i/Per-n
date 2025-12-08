# Response to Customer Portal Team - CSRF Debug Information

**Subject: CSRF Debug Information - Frontend Origin and Network Tab Details**

Hi Customer Portal Team,

Thank you for adding server-side debugging. Here's the information you requested:

**1. Frontend Origin/Domain:**

Please check the Network tab in DevTools to see the exact origin. It should be visible in:
- The request URL
- The `Origin` header in the request
- The `Referer` header

**To find it:**
1. Open DevTools → Network tab
2. Look at any request to your API
3. Check the `Origin` header in Request Headers
4. Or check the `Referer` header

**2. Network Tab - Cookie Header Check:**

**Instructions to check:**
1. Open DevTools → Network tab
2. Make a booking request (or refresh and try again)
3. Find the `POST /api/system/booking/public/bookings` request
4. Click on it
5. Go to "Headers" tab
6. Scroll to "Request Headers"
7. Look for `Cookie:` header

**What to report:**
- Is the `Cookie:` header present? (Yes/No)
- If yes, what cookies are listed?
- Do you see `csrfToken=...`, `XSRF-TOKEN=...`, or `_csrf=...`?

**3. Network Tab - CORS Headers Check:**

**Instructions:**
1. In the same request (`POST /api/system/booking/public/bookings`)
2. Go to "Headers" tab
3. Scroll to "Response Headers"
4. Look for:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Credentials`

**What to report:**
- `Access-Control-Allow-Origin` value: `...`
- `Access-Control-Allow-Credentials` value: `...` (should be `true`)

**4. Console - CORS Errors:**

**Check browser console for:**
- Any CORS-related errors (usually red errors mentioning "CORS" or "Access-Control")
- Any cookie-related warnings
- Any "blocked by CORS policy" messages

**5. Test Debug Endpoint:**

Once you provide the debug endpoint, we'll test it:

```javascript
// Test CSRF cookie transmission
fetch('https://source-database-809785351172.europe-north1.run.app/api/system/booking/public/debug-csrf', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'X-Tenant': 'peranrestaurante'
  }
})
.then(r => r.json())
.then(data => {
  console.log('Debug endpoint response:', data);
})
.catch(err => {
  console.error('Debug endpoint error:', err);
});
```

**6. Quick Test - Check Cookies:**

```javascript
// Check if cookies are accessible (may not show HttpOnly cookies)
console.log('All cookies:', document.cookie);

// Check CORS headers
fetch('https://source-database-809785351172.europe-north1.run.app/api/system/booking/public/bookings', {
  method: 'OPTIONS',
  credentials: 'include'
})
.then(r => {
  console.log('CORS headers:', {
    'Access-Control-Allow-Origin': r.headers.get('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Credentials': r.headers.get('Access-Control-Allow-Credentials'),
    'Access-Control-Allow-Methods': r.headers.get('Access-Control-Allow-Methods'),
    'Access-Control-Allow-Headers': r.headers.get('Access-Control-Allow-Headers')
  });
});
```

**Next Steps:**

After checking the Network tab, please share:
1. Frontend origin/domain (from `Origin` header)
2. Whether `Cookie:` header is present in booking request
3. What cookies are in the `Cookie:` header (if present)
4. CORS response headers values
5. Any CORS errors in console
6. Results from the debug endpoint test

This will help us identify if:
- Cookies aren't being sent (CORS issue)
- Cookies are being sent but with wrong name/value
- CORS headers need to be updated
- Frontend domain needs to be whitelisted

Thank you!

Best regards

