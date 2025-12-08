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
🔐 CSRF token response data: {csrfToken: '32dzRxw1-nSo2zXCiQ8N0vBHZqDsJujYipXg'}
✅ CSRF token obtained: 32dzRxw1-nSo2zXCiQ8N...
📝 Creating booking with CSRF token: 32dzRxw1-nSo2zXCiQ8N...
📝 Full CSRF token: 32dzRxw1-nSo2zXCiQ8N0vBHZqDsJujYipXg
📝 Booking request: {
  url: 'https://source-database-809785351172.europe-north1.run.app/api/system/booking/public/bookings',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': '32dzRxw1-nSo2zXCiQ8N0vBHZqDsJujYipXg',
    'X-Tenant': 'peranrestaurante'
  },
  hasCredentials: true,
  cookies: 'No cookies',  // document.cookie can't read HttpOnly cookies
  hasCSRFCookie: false
}
POST /api/system/booking/public/bookings 403 (Forbidden)
❌ Booking failed: 403 {success: false, message: 'Ogiltig eller saknad CSRF-token'}
```

**CSRF Token Details:**
- Header token: `32dzRxw1-nSo2zXCiQ8N0vBHZqDsJujYipXg`
- Cookie values visible in DevTools: `caX3KQWn-Btsv0nrn7mZEHxYDeNhJZ2bDugY` (from previous request)
- **Token mismatch**: The header token doesn't match the cookie values

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

Please check your server logs for the booking request and verify:

1. **Are cookies being received in the request?**
   - Check the `Cookie` header in the incoming booking request
   - Are `csrfToken`, `XSRF-TOKEN`, or `_csrf` cookies present?
   - What are their values?

2. **Which cookie name does the server check?**
   - `csrfToken`?
   - `XSRF-TOKEN`?
   - `_csrf`?
   - All of them?

3. **Does the cookie value need to match the header token exactly?**
   - We're sending header: `X-CSRF-Token: 32dzRxw1-nSo2zXCiQ8N0vBHZqDsJujYipXg`
   - Does the cookie value need to be exactly `32dzRxw1-nSo2zXCiQ8N0vBHZqDsJujYipXg`?
   - Or can it be different?

4. **Is there a timing issue?**
   - Should we wait after fetching the CSRF token before making the booking request?
   - Or fetch the token synchronously right before each booking?

5. **Are cookies being blocked by CORS/SameSite?**
   - Even though cookies show `SameSite: None` and `Secure: true` in DevTools
   - Are they actually being sent in the request headers?
   - Check server-side if cookies are received

The cookies are set correctly, but the server is still rejecting the request. This suggests either:
- The cookies aren't being sent (despite `credentials: 'include'`)
- The server is checking for a different cookie name/value
- There's a mismatch between the header token and cookie value

Thank you for your help!

Best regards

