# Heath Design Studio — website

Static site: HTML, CSS, and a small JavaScript file. No build step, no dependencies, no third-party requests.
Live: https://heathdesignstudio.com (Netlify project `heath-design-studio`).

## Folder layout

```
site/                     ← this folder is what gets deployed
  index.html              homepage (all sections)
  privacy.html            privacy policy (served at /privacy)
  thank-you.html          form confirmation for visitors without JavaScript
  404.html                not-found page (Netlify uses it automatically)
  css/styles.css          design tokens (top of file) + all styles
  js/main.js              nav, live demos, compare slider, quote form
  fonts/                  self-hosted Inter (SIL Open Font License)
  assets/logo-white.png   header/footer logo (white version of the original artwork)
  assets/logo-white-hd.png  large hero logo
  assets/mark-white.png   the H mark alone (About profile card)
  assets/logo-black.png   original black logo, for light backgrounds
  og-image.png            1200×630 link-preview image
  favicon.png, apple-touch-icon.png, sitemap.xml, robots.txt
  _headers                security + caching headers for Netlify
```

## Updating the live site

1. Open app.netlify.com → **heath-design-studio** → **Deploys**.
2. Drag the unzipped `heath-design-studio-site` folder onto the deploy area.
3. Check **Forms → quote** afterwards. The new optional field `current_site` registers automatically on this deploy.

No build command. Publish directory is the folder root.

## Quote form (Netlify Forms)

- Form detection is enabled and the `quote` form is registered.
- Add an email notification if you haven't: **Forms → Form notifications → Add notification → Email** → heathcaleb00@gmail.com.
- Send a real test from the live site (real email address, full sentences). If one goes missing, check **Spam submissions** first.

## Visitor access

Production is public. Team login protection applies only to non-production deploys (previews).

## Custom domain

The site uses `https://heathdesignstudio.com` in `index.html` (canonical, og:url, og:image, JSON-LD),
`sitemap.xml`, and `robots.txt`. The default Netlify subdomain 301-redirects to it (see `netlify.toml`).

## Editing content

- Text lives directly in the HTML files, one commented block per section.
- Colors, spacing, and type scale are the variables at the top of `css/styles.css`.
- Email appears in: quote section, FAQ, footer, the form's error message
  (`js/main.js`, top of file), JSON-LD in `<head>`, and `privacy.html`.
- Social links: add them in the footer "Contact" list (marked with a comment) once real profile URLs exist.
