# Message to Customer Portal Team - Fresh CSRF Token Still Failing

**Subject: Fresh CSRF Token Fetched But Booking Still Returns 403**

Hi Customer Portal Team,

We've updated our code to fetch a fresh CSRF token right before each booking request (as you recommended), but we're still getting 403 "Ogiltig eller saknad CSRF-token".

**Current Implementation:**
- ✅ Fetching fresh CSRF token right before each booking request
- ✅ Using token immediately (no caching)
- ✅ Including token in `X-CSRF-Token` header
- ✅ Using `credentials: 'include'` in both requests
- ✅ Using correct endpoint: `/api/system/booking/public/bookings`

**Console Logs:**
```
🔐 Fetching fresh CSRF token before booking request...
✅ Fresh CSRF token obtained: nHi5EZ5X-DDllzfOrsaX...
📝 Booking request: {
  url: 'https://source-database-809785351172.europe-north1.run.app/api/system/booking/public/bookings',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': 'nHi5EZ5X-DDllzfOrsaX...',
    'X-Tenant': 'peranrestaurante'
  },
  hasCredentials: true,
  cookies: 'No cookies'  // document.cookie can't read HttpOnly cookies
}
POST /api/system/booking/public/bookings 403 (Forbidden)
❌ Booking failed: 403 {success: false, message: 'Ogiltig eller saknad CSRF-token'}
```

**Cookies Visible in Browser DevTools:**
- `csrfToken`: Set with `SameSite: None`, `Secure: true` ✅
- `XSRF-TOKEN`: Set with `SameSite: None`, `Secure: true` ✅
- `_csrf`: Multiple session cookies ✅

**Questions:**

1. **Are cookies being received in the booking request?**
   - Please check your server logs for the incoming booking request
   - Is the `Cookie` header present?
   - What cookies are being received?
   - What are their values?

2. **Which cookie does the server check for CSRF validation?**
   - `csrfToken`?
   - `XSRF-TOKEN`?
   - `_csrf`?
   - All of them?

3. **Does the cookie value need to match the header token exactly?**
   - We're sending: `X-CSRF-Token: nHi5EZ5X-DDllzfOrsaX...`
   - Does the cookie value need to be exactly `nHi5EZ5X-DDllzfOrsaX...`?
   - Or does the server generate a token from the cookie secret and compare?

4. **Is there a timing issue?**
   - We fetch CSRF token, then immediately make booking request
   - Should we wait a bit for the cookie to be set?
   - Or is there something else we need to do?

5. **Are cookies being blocked despite SameSite: None?**
   - Cookies show `SameSite: None` and `Secure: true` in DevTools
   - But are they actually being sent in the request headers?
   - Could there be a CORS issue preventing cookies from being sent?

**Request:**

Please check your server logs for the booking request and verify:
1. Are cookies being received? (Check `Cookie` header)
2. Which cookie name/value is being checked for CSRF validation?
3. What is the exact validation logic? (Does token need to match cookie value, or is token generated from cookie secret?)
4. Are there any CORS or cookie-related errors in the server logs?

**Our Frontend Details:**
- Frontend origin: (please check - we're making cross-origin requests)
- Using HTTPS
- Using `credentials: 'include'` in all requests
- Fetching fresh CSRF token right before each booking request

The cookies are set correctly in the browser, but the server is still rejecting the request. This suggests either:
- Cookies aren't being sent (despite `credentials: 'include'`)
- Server is checking for a different cookie name/value
- There's a mismatch in the validation logic

Thank you for your help!

Best regards

