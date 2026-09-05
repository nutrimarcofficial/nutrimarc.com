# NutriMarc State-of-the-Art UI Revision

This build modernizes the frontend while preserving the existing NHFS commerce, NAIS registration, inquiry, CSR, and backend integration logic.

## Visual system
- Premium glass/sticky navigation
- Large editorial hero with responsive typography
- Green/gold NutriMarc luxury palette
- Layered gradients, subtle grid textures, soft glass surfaces and depth
- Marketplace-style food cards with category-specific visual treatments
- Refined cart, checkout, bootcamp, CSR, enquiry and modal styling
- Responsive desktop/tablet/mobile layouts
- Reduced-motion accessibility support

## Functional areas preserved
- NHFS catalog and pack-size pricing
- Category filters and product search
- Quantity, cart, coupon and checkout flows
- Razorpay backend endpoints and payment verification architecture
- NAIS bootcamp selection and registration
- Personalized post-registration advisor message
- Corporate/general enquiry endpoints
- CSR content

## Production activation
Real payment and automatic email delivery still require the environment variables documented in DEPLOYMENT.md. Secrets must remain server-side.
