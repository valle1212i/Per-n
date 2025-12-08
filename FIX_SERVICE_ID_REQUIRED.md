# Fix: Service ID Required for Restaurant Bookings

## Issue
The API requires a valid `serviceId` for all bookings, including restaurants. We were sending `serviceId: null` for restaurant bookings, which caused validation errors.

## Solution
1. **Auto-select first service for restaurants**: If no service is selected for restaurant bookings, automatically use the first available service from the API
2. **Always use valid serviceId**: Never send `null` for `serviceId` - always use a valid service ID
3. **Include partySize**: Send `partySize` (guests) in the booking request for restaurants

## Changes Made

### `src/components/BookingForm.jsx`
- Updated booking creation to auto-select first service for restaurants if none selected
- Always use valid `serviceId` (never null)
- Include `partySize` in booking data for restaurants

### `src/services/booking.js`
- Updated `createBooking` to include `partySize`/`guests` in request body
- Also include `notes` and `specialRequests` if provided

## Expected Behavior
- Restaurant bookings will automatically use the first available service if none is selected
- All bookings will include a valid `serviceId`
- Restaurant bookings will include `partySize` (number of guests)
- CSRF validation is working correctly (cookies are being sent)

## Testing
1. Make a restaurant booking without selecting a service
2. Verify the booking uses the first available service
3. Verify `partySize` is included in the request
4. Verify booking succeeds with valid `serviceId`

