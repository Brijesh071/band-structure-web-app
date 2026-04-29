# Band Structure Web Sandbox

Static browser app for interactive band-structure exploration. The app is plain HTML, CSS, and JavaScript with no build step.

## Run locally

From the project root:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://127.0.0.1:8080
```

## Validate

```bash
node validate-web-solver.mjs
```

## Share it with everyone

This app is a static site, so the easiest hosting options are:

### GitHub Pages

Push the repo to GitHub, then in the repo settings:

1. Open `Settings -> Pages`
2. Set source to the branch you want to publish
3. Set the published folder to `/ (root)`

GitHub will give you a public URL like:

```text
https://your-username.github.io/your-repo-name/
```

### Netlify

1. Sign in to Netlify
2. Import the GitHub repo
3. Leave build command empty
4. Set publish directory to `.`

### Vercel

1. Import the GitHub repo
2. Framework preset: `Other`
3. Leave build command empty
4. Output directory: `.`

### Cloudflare Pages

1. Connect the GitHub repo
2. Build command: empty
3. Build output directory: `.`

## Notes

- Do not host this by opening `index.html` directly as a `file://` URL. ES module imports should be served over HTTP.
- The files that matter for deployment are:
  - `index.html`
  - `app.js`
  - `solver.js`
  - `styles.css`
