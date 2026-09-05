# NutriMarc Website — Revised Build

This build fixes the blank/logo-only rendering problem by making the main frontend self-contained: the CSS and application JavaScript are embedded directly in index.html, so deployment cannot fail because css/style.css or script.js is not found.

## Included
- Ultra-modern NutriMarc Group landing page
- NHFS professional product marketplace using the supplied menu/prices
- Offer of the Day + NUTRI10 coupon
- Product search, category filters, pack sizes, quantities and cart
- Checkout customer form
- NAIS professional bootcamp registration
- Personalized registration confirmation + call/WhatsApp support
- CSR section
- Responsive desktop/tablet/mobile design
- Node.js backend for email and Razorpay verification

## Production activation
The frontend can be served as static HTML, but real payment processing and automatic email delivery require the included server to be deployed and configured with Razorpay/Resend environment variables.
