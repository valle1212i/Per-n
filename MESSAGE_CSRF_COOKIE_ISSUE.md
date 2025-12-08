# Message to Customer Portal Team - CSRF Cookie Issue

**Subject: CSRF Token Header Present But Cookie Missing - 403 Forbidden**

Hi Customer Portal Team,

We're successfully fetching the CSRF token from `/api/csrf-token`, but the booking request is still being rejected with 403 "Ogiltig eller saknad CSRF-token".

**What's Working:**
- ✅ CSRF token fetch: `GET /api/csrf-token` returns `{ csrfToken: "..." }` successfully
- ✅ CSRF token header: We're including `X-CSRF-Token: <token>` in the booking request headers
- ✅ Credentials: We're using `credentials: 'include'` in both requests

**What's Not Working:**
- ❌ Booking request: `POST /api/system/booking/bookings` returns 403 Forbidden
- ❌ Error message: "Ogiltig eller saknad CSRF-token"

**Console Logs:**
```
🔐 Fetching CSRF token from: https://source-database-809785351172.europe-north1.run.app/api/csrf-token
🔐 CSRF token response status: 200
🔐 CSRF token response data: {csrfToken: 'Ve0ZuMjg-l7PbKU9CSTODMj10DLz4yIStKhk'}
✅ CSRF token obtained: Ve0ZuMjg-l7PbKU9CSTO...
📝 Creating booking with CSRF token: Ve0ZuMjg-l7PbKU9CSTO...
📝 Booking request: {url: '...', method: 'POST', headers: {...}, hasCredentials: true}
POST /api/system/booking/bookings 403 (Forbidden)
📝 Booking response status: 403
❌ Booking failed: 403 {success: false, message: 'Ogiltig eller saknad CSRF-token'}
```

**Questions:**

1. **Is a CSRF cookie being set when we fetch `/api/csrf-token`?**
   - What is the cookie name? (e.g., `csrf`, `_csrf`, `csrfToken`)
   - What are the cookie attributes? (SameSite, Secure, HttpOnly, Domain, Path)

2. **Does the booking endpoint require BOTH the header AND the cookie?**
   - Or just the header?
   - Or just the cookie?

3. **Are there CORS restrictions preventing the cookie from being sent?**
   - Our frontend origin: (checking)
   - Do we need specific CORS headers for credentials?

4. **Is there a timing issue?**
   - Do we need to wait after fetching the CSRF token before making the booking request?
   - Or is there a session requirement?

**Request:**

Please verify:
1. That the CSRF cookie is being set correctly when fetching `/api/csrf-token`
2. The exact cookie name and attributes required
3. Whether there are any CORS or SameSite restrictions preventing the cookie from being sent
4. If there's a different flow we should follow for public booking creation

We're including the CSRF token in the `X-CSRF-Token` header as specified, but the server is still rejecting the request. This suggests the cookie might not be present or not being sent with the booking request.

Thank you for your help!

Best regards

