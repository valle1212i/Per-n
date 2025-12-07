# Message to Customer Portal Team - Provider Dropdown Still Showing

**Subject: Provider Dropdown Still Visible for Restaurant Bookings**

Hi Customer Portal Team,

We've implemented the restaurant booking form according to your specifications, which states that restaurants should not show service/provider selectors (like "Välj bordstorlek" or "Välj serveringspersonal"). However, the "Personal" (provider) dropdown is still appearing on the booking page.

**Current Implementation:**

Our frontend code is checking for restaurant bookings using:
- `bookingSettings.businessType === 'restaurant'`
- OR presence of `formLabels.partySize` (restaurant-specific field)

If either condition is true, we hide the service and provider selectors.

**What We're Seeing:**

The provider dropdown ("Välj serveringspersonal") is still visible, which suggests:
1. The `businessType` field might not be set to `'restaurant'` in the API response
2. The `formLabels.partySize` field might not be present in the response
3. The API response structure might be different than expected

**Questions:**

1. **Is `businessType: 'restaurant'` being returned in the `/api/system/booking/public/settings` response?**
   - If yes, is it at `settings.businessType` or `data.businessType` (root level)?

2. **Is `industryTerminology.formLabels.partySize` being returned in the response?**
   - This field should contain "Antal personer" for restaurants

3. **What is the exact structure of the settings response for restaurant tenants?**
   - Can you share a sample response (with sensitive data redacted)?

4. **Should we be checking a different field to detect restaurant bookings?**

**Debug Information:**

We've added console logging to verify the API response. The logs show:
- Settings object structure
- Industry terminology structure
- Whether `businessType` is present and its value
- Whether `formLabels.partySize` is present

**Expected Behavior:**

For restaurant bookings (tenant: "peranrestaurante"), the form should:
- ✅ Hide service selector ("Välj bordstorlek")
- ✅ Hide provider selector ("Välj serveringspersonal")
- ✅ Show party size field ("Antal personer")
- ✅ Show date, time, and customer information fields

**Current Behavior:**

- ❌ Provider selector is still visible
- ✅ Service selector is hidden (working correctly)
- ✅ Other restaurant-specific fields are showing correctly

**Request:**

Please verify:
1. That the API is returning `businessType: 'restaurant'` for tenant "peranrestaurante"
2. That `industryTerminology.formLabels.partySize` is present in the response
3. The exact field path we should use to detect restaurant bookings

If the API is returning the correct data, we may need to adjust our detection logic. If the API is not returning this data, please update it so we can properly hide the provider dropdown.

Thank you for your help!

Best regards

