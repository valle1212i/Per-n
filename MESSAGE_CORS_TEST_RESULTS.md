# Message to Customer Portal Team - CORS Test Results

**Subject: CORS Test Results - Headers Still Null, Request Server Logs**

Hi Customer Portal Team,

We've tested the booking flow after your debug logging deployment. Here are our browser-side results:

**Browser Console Results:**

1. **CSRF Token Fetch:**
   ```
   🔐 Fetching fresh CSRF token before booking request...
   ✅ Fresh CSRF token obtained: gIItokT8-AgmI-XThXX1...
   ```
   ✅ CSRF token is being fetched successfully

2. **Booking Request:**
   ```
   📝 Booking request: {
     url: 'https://source-database-809785351172.europe-north1.run.app/api/system/booking/public/bookings',
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'X-CSRF-Token': 'gIItokT8-AgmI-XThXX1...',
       'X-Tenant': 'peranrestaurante'
     },
     hasCredentials: true,
     cookies: 'No cookies'  // ❌ Cookies still not being sent
   }
   ```
   ❌ Cookies show "No cookies" (not being sent)

3. **Response:**
   ```
   POST /api/system/booking/public/bookings 403 (Forbidden)
   ❌ Booking failed: 403 {success: false, message: 'Ogiltig eller saknad CSRF-token'}
   ```
   ❌ Still getting 403 error

4. **CORS Headers Test (OPTIONS):**
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
   Result: Promise fulfilled but CORS headers still `null`

**What We Need:**

Please check your server logs for the debug messages. We need to know:

1. **For the OPTIONS request:**
   - `🔍 CORS DEBUG: Booking request - Path: ..., OriginalUrl: ..., URL: ..., Method: OPTIONS`
   - `🔍 CORS DEBUG: isPublicBookingEndpoint check - Result: true/false`
   - `🌐 CORS: Public booking endpoint detected - Origin: ...`
   - `✅ CORS: Preflight handled for public booking endpoint`

2. **For the POST request:**
   - `🔍 CORS DEBUG: Booking request - Path: ..., OriginalUrl: ..., URL: ..., Method: POST`
   - `🔍 CORS DEBUG: isPublicBookingEndpoint check - Result: true/false`
   - `🌐 CORS: Public booking endpoint detected - Origin: ...`
   - `✅ CORS: Headers set for public booking endpoint`

**Questions:**

1. **Is path matching working?**
   - What does `isPublicBookingEndpoint check - Result:` show?
   - If `false`, what are the `Path`, `OriginalUrl`, and `URL` values?

2. **Is the origin being detected?**
   - What does `Origin:` show in the logs?
   - Is it our frontend origin or "none"?

3. **Are headers being set?**
   - Do you see `✅ CORS: Headers set` in the logs?
   - If yes, why aren't they reaching the browser?

**Request:**

Please share:
1. The server log output for both OPTIONS and POST requests
2. Whether path matching is working (`Result: true/false`)
3. What the `Path`, `OriginalUrl`, `URL`, and `Origin` values are
4. Whether CORS headers are being set in the response

This will help us identify where the CORS headers are being lost.

Thank you!

Best regards

