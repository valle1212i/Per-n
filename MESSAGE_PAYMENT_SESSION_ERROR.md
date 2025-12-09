# Message to Customer Portal Team - Payment Session Creation Error

**Subject: 500 Error When Creating Payment Session for Booking Products**

Hi Customer Portal Team,

We're getting a **500 Internal Server Error** when trying to create a booking with products selected. The error occurs when the API tries to create a Stripe checkout session.

**Error Details:**

- **Status Code**: `500 Internal Server Error`
- **Endpoint**: `POST /api/system/booking/public/bookings`
- **Error Message**: `"Ett fel uppstod vid skapande av betalningssession. Försök igen senare."` (An error occurred while creating the payment session. Try again later.)

**What We're Sending:**

Our booking request includes:
- ✅ All required fields (serviceId, start, end, customerName, email, etc.)
- ✅ `productIds` array with selected product IDs
- ✅ Valid CSRF token
- ✅ X-Tenant header: `peranrestaurante`

**Request Body Example:**

```json
{
  "serviceId": "<valid-service-id>",
  "providerId": null,
  "start": "2025-12-09T19:00:00.000Z",
  "end": "2025-12-09T21:00:00.000Z",
  "customerName": "<customer-name>",
  "email": "<email>",
  "phone": "<phone>",
  "partySize": 2,
  "productIds": ["prod_1234567890"],
  "status": "confirmed"
}
```

**What We Need:**

Please check your **server logs** for:

1. **Stripe API errors** - What error is Stripe returning when creating the checkout session?
2. **Product validation** - Are the product IDs valid and accessible?
3. **Stripe configuration** - Are Stripe API keys configured correctly?
4. **Checkout session creation** - What parameters are being sent to Stripe?
5. **Full error stack trace** - What's causing the 500 error?

**Possible Causes:**

1. **Stripe API Key Missing/Invalid** - Stripe secret key not configured or invalid
2. **Product Not Found** - Product IDs don't exist in Stripe or don't match tenant
3. **Stripe API Error** - Stripe is returning an error when creating checkout session
4. **Missing Required Fields** - Checkout session missing required parameters (success_url, cancel_url, etc.)
5. **Tenant Configuration** - Stripe account not linked to tenant "peranrestaurante"

**Request:**

Please share:
1. The **full error stack trace** from your server logs
2. The **Stripe API error** (if any) when creating checkout session
3. Whether **Stripe is configured** for tenant "peranrestaurante"
4. The **exact parameters** being sent to Stripe when creating the checkout session

**Testing:**

We've tested:
- ✅ Booking without products works correctly
- ✅ Products are being fetched successfully
- ✅ Product IDs are valid Stripe product IDs
- ❌ Booking with products fails with 500 error

**Next Steps:**

Once we have the server logs, we can determine if:
- The issue is on the backend (Stripe configuration/API)
- We need to send different data
- There's a configuration issue that needs to be fixed

Thank you!

Best regards

