# NutriMarc Group website

Ultra-modern static GitHub Pages website for **NutriMarc Group**, with:

- NutriMarc Healthy Food Services (NHFS) menu and cart
- UPI payment initiation to `admn.chand@ibl`
- Unique NHFS order references
- Website/general enquiry form
- NAIS enquiry form with `NAIS-...` reference numbers
- NAIS upcoming course schedule and downloadable course PDFs
- Course subscription form
- Live announcement banner
- Responsive design
- SEO metadata, canonical URL, Open Graph, WebSite + Organization structured data
- `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `404.html`, and `CNAME`

## Important: email forms

The site is static so it can be hosted directly on GitHub Pages. Forms use FormSubmit (`https://formsubmit.co/contact@nutrimarc.com`) to deliver submissions to the NutriMarc email address. On first use, FormSubmit may ask the recipient to confirm/activate the email endpoint. If you later prefer your own backend, replace the form endpoint in `index.html` and keep the existing client-side reference-number generation.

## Important: payments

The current checkout uses a standard UPI payment intent pointing to **admn.chand@ibl**. This allows supported mobile UPI apps to initiate payment directly. It is not a card gateway or server-verified payment system. For automatic payment verification, refunds, webhooks and settlement reporting, integrate a provider such as Razorpay/PayU/Cashfree using a secure backend/serverless function; never place a gateway secret key in `script.js`.

## Edit products and courses

Open `script.js` and edit:

- `CONFIG` for UPI and announcements
- `menu` for NHFS products/prices
- `courses` for NAIS programs, dates, descriptions and PDF paths

## Deploy to GitHub Pages

1. Create a GitHub repository, for example `nutrimarc-website`.
2. Upload all files/folders from this directory to the repository root.
3. Keep `index.html` in the root.
4. In GitHub: **Settings → Pages → Deploy from branch → main → / (root)**.
5. Add the custom domain `nutrimarc.com` in **Settings → Pages**.
6. At your domain DNS provider, configure the GitHub Pages records shown by GitHub. For an apex domain, GitHub currently documents A records for `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`; configure `www` as a CNAME to your GitHub Pages host if desired.
7. Enable **Enforce HTTPS** after GitHub provisions the certificate.
8. In Google Search Console, verify `nutrimarc.com`, submit `https://nutrimarc.com/sitemap.xml`, and use URL Inspection → Request indexing for the home page.

## SEO expectation

The code includes the technical elements needed to make the site crawlable and understandable to Google, but no code can guarantee that Google will immediately show `nutrimarc.com` for the search term “nutrimarc”. Google controls crawling, indexing, title generation and ranking. Search Console submission, consistent brand references, links from relevant sites, useful content and time will help.
