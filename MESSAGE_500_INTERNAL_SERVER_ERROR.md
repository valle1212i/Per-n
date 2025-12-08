# Message to Customer Portal Team - 500 Internal Server Error

**Subject: 500 Internal Server Error When Creating Booking - Need Server Logs**

Hi Customer Portal Team,

We're now getting a **500 Internal Server Error** when trying to create a booking. This is a server-side error, not a validation error.

**Error Details:**

- **Status Code**: `500 Internal Server Error`
- **Endpoint**: `POST /api/system/booking/public/bookings`
- **Error Message**: `"Ett fel uppstod vid skapande av bokning"` (An error occurred while creating the booking)

**What We're Sending:**

Based on our client-side logs, we're sending:

```json
{
  "serviceId": "<valid-service-id>",
  "providerId": null,
  "start": "2025-12-09T11:30:00.000Z",
  "end": "2025-12-09T13:30:00.000Z",
  "customerName": "<customer-name>",
  "email": "<email>",
  "phone": "<phone>",
  "status": "confirmed",
  "guests": <number>,
  "notes": null,
  "specialRequests": null
}
```

**What We Need:**

Please check your **server logs** for:

1. **The full error stack trace** - What caused the 500 error?
2. **The request body received** - Does it match what we're sending?
3. **Any database errors** - Is there an issue saving the booking?
4. **Any validation errors** - Are there server-side validation issues we're not seeing?

**Possible Causes:**

1. **Database connection issue** - Can't save the booking to the database
2. **Missing required field** - Server-side validation failing
3. **Invalid data format** - Date format or other field format issue
4. **Service/Provider lookup** - Can't find the service or provider
5. **Tenant validation** - Issue with tenant ID validation

**Client-Side Logs:**

Our browser console shows:
- ✅ CSRF token fetched successfully
- ✅ Request includes all required fields (serviceId, start, end, customerName)
- ✅ Dates are in ISO format
- ✅ Headers include X-CSRF-Token and X-Tenant
- ❌ Server returns 500 error

**Request:**

Please share:
1. The **full error stack trace** from your server logs
2. The **request body** that was received
3. Any **validation errors** or **database errors**
4. The **exact line** where the error occurred

This will help us identify what's causing the 500 error and fix it.

Thank you!

Best regards

