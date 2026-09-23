# Adcox.AI (Bootstrap 5)

A static landing page for [Adcox.AI](https://adcox.ai), styled with Bootstrap 5 from public CDN.

Features
- Animated **F5-Friendly** banner that types, spins, and tracks uptime
- “Hire Me” button to send email to preferred email address
- No build step, pure HTML/CSS/JS

## Deployment

The public site is deployed from the `main` branch through Appwrite Sites as a static Vanilla JS site. Pushing to `main` triggers the connected Appwrite deployment.

Appwrite build settings should use the repository root as the output directory. Do not configure `index.html` as an SPA fallback: this is a multi-page static site, and an SPA fallback turns missing URLs into homepage soft 404s. After changing the fallback setting, redeploy and verify that an unknown URL returns HTTP 404.

The root-level `robots.txt`, `sitemap.xml`, and `404.html` files must remain in the deployed output.
