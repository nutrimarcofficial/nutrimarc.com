# NutriMarc website upgrade — deployment notes

## What is included

- NHFS catalogue recreated from the supplied price-list image.
- Pack-size selection, quantities, cart, coupon application and checkout customer details.
- Razorpay Standard Checkout integration for UPI/QR, cards and net banking. The backend creates Razorpay orders and verifies the returned payment signature server-side.
- NAIS multi-program bootcamp registration form with name, phone, email and request details.
- Automatic admin email to `contact@nutrimarc.com` through Resend when the backend is configured.
- Personalized registration confirmation and advisor call/WhatsApp details.

## Important before going live

The supplied website is a static site (it has a `CNAME` for `nutrimarc.com`). A static GitHub Pages host cannot safely hold Razorpay secrets or send server-side email. Deploy the `server/` folder to a Node-capable host such as Render, Railway, Fly.io, an AWS service, or your own server.

1. Copy `server/.env.example` to `server/.env`.
2. Add your Razorpay **test** key ID and key secret first.
3. Add a Resend API key and verify the sending domain/address you want to use in `EMAIL_FROM`.
4. Set `ADMIN_EMAIL=contact@nutrimarc.com`.
5. Set `FRONTEND_ORIGIN=https://nutrimarc.com` (and add the `www` origin if you serve it separately).
6. Run `npm install` inside `server/`, then `npm start`.
7. Set `window.NUTRIMARC_API_BASE_URL` before `script.js` if the API is hosted on another domain, for example `https://api.example.com/api`.
8. Test the full flow using Razorpay Test Mode before replacing the test keys with Live Mode keys.
9. Configure Razorpay automatic capture and webhooks/reconciliation for production. Razorpay recommends creating every payment against a server-side order and verifying the payment signature server-side before fulfilling the order. See the official integration guide: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
10. For email delivery, Resend's Node SDK is used; configure a verified production sending domain/address. See https://resend.com/nodejs.

## Offer of the day

The current front-end/server configuration uses:

- Coupon: `NUTRI10`
- Discount: 10%
- Maximum discount: ₹200
- Minimum subtotal: ₹499

Change the offer in **both** `script.js` (`OFFER`) and `server/server.js` (`COUPON`) before advertising a different live promotion.

## Shipping

The supplied menu says:
- Free shipping within 5 km of Bachupally.
- Free shipping anywhere on orders above ₹1,499.

The website displays these rules. It does not automatically calculate geographic distance; if you want automatic 5-km eligibility, add a Maps/geocoding service and a verified delivery address workflow before charging customers a non-free shipping amount.

## Email address

The website uses `contact@nutrimarc.com`. The earlier request contained `contact@nutirmarc.com`; this implementation uses the NutriMarc domain spelling.


## Premium UI / reliability refresh
This version includes a redesigned responsive storefront, category filters, product search, professional product cards, improved cart controls, resilient coupon-copy behavior, NAIS registration and inquiry API endpoints, and clearer success/error states.

### Required production configuration
Set these server environment variables:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM` (must be an address/domain verified with your email provider)
- `ADMIN_EMAIL=contact@nutrimarc.com`
- `FRONTEND_ORIGIN=https://nutrimarc.com`

Do not place Razorpay secrets or email API keys in frontend files.

### Important payment note
The frontend verifies the Razorpay signature through the server. For a production commerce deployment, also configure Razorpay webhooks and persistent order storage/database so payment/order state survives server restarts and can be reconciled if a customer closes the browser or a network interruption occurs.
