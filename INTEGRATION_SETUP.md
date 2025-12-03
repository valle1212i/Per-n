# Customer Portal Integration Setup Guide

This guide explains how to set up the customer portal integration for Perán restaurant website.

## 📋 Prerequisites

1. Access to the customer portal at `https://source-database-809785351172.europe-north1.run.app`
2. Your exact tenant ID (case-sensitive)

## 🔧 Step 1: Get Your Tenant ID

1. Log into the customer portal
2. Open browser console (F12)
3. Run this command:
   ```javascript
   fetch('https://source-database-809785351172.europe-north1.run.app/api/profile/me', {
     credentials: 'include'
   })
   .then(r => r.json())
   .then(data => console.log('Your tenant:', data.tenant))
   ```
4. Copy the exact tenant value (e.g., `'peran'`, `'peran-restaurant'`)

## ⚙️ Step 2: Configure API Settings

Edit `src/config/api.js` and replace `'your-exact-tenant'` with your actual tenant ID:

```javascript
export default {
  baseURL: 'https://source-database-809785351172.europe-north1.run.app',
  tenant: 'your-exact-tenant', // ✅ Replace with your actual tenant ID
};
```

**OR** use environment variables (recommended for production):

Create a `.env` file in the project root:

```bash
VITE_API_BASE_URL=https://source-database-809785351172.europe-north1.run.app
VITE_TENANT_ID=your-exact-tenant
```

## 📅 Step 3: Set Up Booking System (Required)

The booking system requires services and providers to be configured in the customer portal.

### In Customer Portal:

1. **Create Services** (e.g., "Matsalen", "Sinnenas bord", "Opium Bar")
   - Go to Booking System → Services
   - Add each service with duration (e.g., 120 minutes for dinner)

2. **Create Providers** (e.g., "Matsalen", "Sinnenas bord", "Opium Bar")
   - Go to Booking System → Providers
   - Add each provider/staff member

### In Your Website:

The booking form automatically:
- ✅ Fetches services and providers from the API
- ✅ Shows available time slots based on existing bookings
- ✅ Prevents double-booking
- ✅ Creates bookings in the customer portal

## 📊 Step 4: Analytics Tracking

Analytics tracking is automatically enabled when users accept cookies. The system tracks:
- Page views
- Form submissions
- CTA clicks

No additional configuration needed!

## 📬 Step 5: Contact Forms (Optional)

If you want to add contact forms, use the contact service:

```javascript
import { sendContactMessage } from './services/contact'

const result = await sendContactMessage({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+46701234567',
  subject: 'Kontaktformulär',
  message: 'Hello!'
})
```

## 🧪 Testing

### Test Booking System:

1. Make sure services and providers exist in customer portal
2. Go to `/book` page
3. Fill out the booking form
4. Submit and verify booking appears in customer portal

### Test Analytics:

1. Accept cookies
2. Navigate between pages
3. Check customer portal → Analytics → Page Views

## 🔍 Troubleshooting

### Bookings Not Appearing

1. ✅ Verify tenant ID matches exactly (case-sensitive)
2. ✅ Check services and providers exist in customer portal
3. ✅ Verify user is logged into customer portal (for testing)
4. ✅ Check browser console for errors

### Services/Providers Not Loading

1. ✅ Verify tenant ID is correct
2. ✅ Check that services/providers are marked as "active" in customer portal
3. ✅ Check browser console for API errors
4. ✅ Verify CORS is enabled (should be automatic)

### CSRF Token Errors

1. ✅ Ensure cookies are enabled
2. ✅ Check that `credentials: 'include'` is set in fetch requests
3. ✅ Verify CSRF endpoint is accessible

## 📚 API Services Available

### Booking Service (`src/services/booking.js`)
- `fetchServices()` - Get all services
- `fetchProviders()` - Get all providers
- `fetchBookings()` - Get bookings for date range
- `createBooking()` - Create new booking
- `updateBooking()` - Update existing booking
- `cancelBooking()` - Cancel booking
- `checkAvailability()` - Check if time slot is available
- `generateAvailableSlots()` - Generate available time slots

### Contact Service (`src/services/contact.js`)
- `sendContactMessage()` - Send contact form message

### Analytics Service (`src/services/analytics.js`)
- `trackPageView()` - Track page view
- `trackEvent()` - Track custom event
- `trackFormSubmit()` - Track form submission
- `trackFormStart()` - Track form start
- `trackCTAClick()` - Track CTA click

### CSRF Service (`src/services/csrf.js`)
- `getCSRFToken()` - Get CSRF token for authenticated requests

## 🎯 Next Steps

1. ✅ Configure tenant ID
2. ✅ Set up services and providers in customer portal
3. ✅ Test booking form
4. ✅ Verify analytics tracking
5. ✅ (Optional) Add contact forms
6. ✅ (Optional) Add payment tracking (see Backend_Implementation_for_New_Customers.md)

## 📖 Full Documentation

See `Backend_Implementation_for_New_Customers.md` for complete API documentation including:
- Payment integration
- Inventory tracking
- AI assistant feedback
- Marketing integration
- And more!

