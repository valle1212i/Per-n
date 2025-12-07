# Customer Portal API Issue Report

## Current Status
The frontend booking form is now working correctly and making API requests, but all booking API endpoints are returning **404 Not Found** errors.

## API Endpoints Being Called
The frontend is making requests to the following public endpoints with the tenant header `X-Tenant: peranrestaurante`:

1. **Services Endpoint:**
   ```
   GET https://source-database-809785351172.europe-north1.run.app/api/system/booking/public/services?isActive=true
   Headers: X-Tenant: peranrestaurante
   Status: 404 Not Found
   ```

2. **Providers Endpoint:**
   ```
   GET https://source-database-809785351172.europe-north1.run.app/api/system/booking/public/providers?isActive=true
   Headers: X-Tenant: peranrestaurante
   Status: 404 Not Found
   ```

3. **Settings Endpoint:**
   ```
   GET https://source-database-809785351172.europe-north1.run.app/api/system/booking/public/settings
   Headers: X-Tenant: peranrestaurante
   Status: 404 Not Found
   ```

## Expected Behavior
These public endpoints should return:
- **Services:** Array of active bookable services for the tenant
- **Providers:** Array of active staff/providers for the tenant
- **Settings:** Booking settings including opening hours and form field configuration

## Questions for Customer Portal Team
1. Are these public endpoints (`/api/system/booking/public/*`) deployed and available?
2. Is the base URL `https://source-database-809785351172.europe-north1.run.app` correct?
3. Is the tenant ID `peranrestaurante` correctly configured in the system?
4. Are there any authentication or CORS requirements for these public endpoints?
5. Should the endpoint paths be different (e.g., `/api/booking/public/*` instead of `/api/system/booking/public/*`)?

## Frontend Status
✅ Frontend is correctly configured and making requests
✅ Tenant header is being sent correctly
✅ Error handling is in place (form displays gracefully when APIs fail)
❌ API endpoints are not responding (404 errors)

## Next Steps
Once the API endpoints are available and returning data, the booking form will automatically:
- Display available services and providers
- Show booking calendar with correct opening hours
- Allow customers to create bookings

Please verify the API endpoints are deployed and accessible, or provide the correct endpoint URLs if they differ from what we're using.

