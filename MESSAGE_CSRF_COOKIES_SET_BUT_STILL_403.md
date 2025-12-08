# Message to Customer Portal Team - CSRF Cookies Set But Still Getting 403

**Subject: CSRF Cookies Present But Booking Request Still Fails**

Hi Customer Portal Team,

Thank you for updating the CSRF cookie settings! The cookies are now being set correctly:

**Cookies Visible in Browser DevTools:**
- `csrfToken`: `caX3KQWn-Btsv0nrn7mZEHxYDeNhJZ2bDugY` (SameSite: None, Secure: true) ✅
- `XSRF-TOKEN`: `caX3KQWn-Btsv0nrn7mZEHxYDeNhJZ2bDugY` (SameSite: None, Secure: true) ✅
- `_csrf`: Multiple entries (Session cookies)

**What's Working:**
- ✅ CSRF token fetch: Returns token successfully
- ✅ CSRF cookies are being set with correct attributes (SameSite: None, Secure: true)
- ✅ Using correct endpoint: `/api/system/booking/public/bookings`
- ✅ Including `X-CSRF-Token` header with the token value
- ✅ Using `credentials: 'include'` in both requests

**What's Not Working:**
- ❌ Booking request still returns 403 "Ogiltig eller saknad CSRF-token"
- ❌ `document.cookie` shows "No cookies" (but cookies are visible in DevTools - likely HttpOnly)

**Console Logs:**
```
🔐 Fetching CSRF token from: https://source-database-809785351172.europe-north1.run.app/api/csrf-token
🔐 CSRF token response status: 200
🔐 CSRF token response data: {csrfToken: 'YzOPzXuQ-31Fr-Vfa3Hk6f2cJEf6_pIvaxiE'}
✅ CSRF token obtained: YzOPzXuQ-31Fr-Vfa3Hk...
📝 Creating booking with CSRF token: YzOPzXuQ-31Fr-Vfa3Hk...
📝 Booking request: {
  url: 'https://source-database-809785351172.europe-north1.run.app/api/system/booking/public/bookings',
  method: 'POST',
  headers: {...},
  hasCredentials: true,
  cookies: 'No cookies',  // document.cookie can't read HttpOnly cookies
  hasCSRFCookie: false
}
POST /api/system/booking/public/bookings 403 (Forbidden)
❌ Booking failed: 403 {success: false, message: 'Ogiltig eller saknad CSRF-token'}
```

**Questions:**

1. **Which cookie name does the server check for CSRF validation?**
   - `csrfToken`?
   - `XSRF-TOKEN`?
   - `_csrf`?
   - All of them?

2. **Does the cookie value need to match the header token exactly?**
   - We're sending `X-CSRF-Token: YzOPzXuQ-31Fr-Vfa3Hk6f2cJEf6_pIvaxiE`
   - Cookie `csrfToken` has value: `caX3KQWn-Btsv0nrn7mZEHxYDeNhJZ2bDugY`
   - Cookie `XSRF-TOKEN` has value: `caX3KQWn-Btsv0nrn7mZEHxYDeNhJZ2bDugY`
   - These don't match - is that the issue?

3. **Should we fetch a fresh CSRF token right before creating the booking?**
   - Currently we might be using a cached token
   - Should we fetch the token synchronously before each booking request?

4. **Are the cookies being sent in the request?**
   - We're using `credentials: 'include'` which should send cookies automatically
   - But maybe there's a domain/path mismatch preventing them from being sent?

**Request:**

Please verify:
1. That the CSRF cookie is actually being sent in the booking request headers (check server logs)
2. Which cookie name/value the server expects for CSRF validation
3. Whether the cookie value needs to match the `X-CSRF-Token` header value exactly
4. If there are any other requirements for CSRF validation on the public booking endpoint

The cookies are set correctly, but the server is still rejecting the request. This suggests either:
- The cookies aren't being sent (despite `credentials: 'include'`)
- The server is checking for a different cookie name/value
- There's a mismatch between the header token and cookie value

Thank you for your help!

Best regards

