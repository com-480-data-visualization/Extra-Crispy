# Website (Vite + React + GitHub Pages)

This website follows the same deployment style as your previous ADA project:

- Build with Vite into `dist/`
- Use GitHub Actions to deploy `dist/` automatically
- Publish through GitHub Pages (`gh-pages` branch)

## 1. Project structure

- `index.html`: Vite entry file
- `index.tsx`: main React app entry (aligned with your reference repo structure)
- `styles.css`: base styles for the initial page
- `vite.config.ts`: includes GitHub Pages base path logic
- `.github/workflows/deploy-website.yml`: automated deployment workflow

## 2. Local development

From repository root:

```bash
cd website
npm install
npm run dev
```

Then open the local URL shown in terminal (usually `http://localhost:5173`).

## 3. Local production test (recommended)

Before pushing, verify the production build:

```bash
cd website
npm run build
npm run preview
```

This helps catch path/build problems early.

## 4. First-time GitHub Pages setup

1. Push this repository to GitHub (if not already).
2. Ensure the default branch is `main`.
3. In GitHub repo settings, open **Pages**.
4. Source should be the `gh-pages` branch (root folder).

If `gh-pages` does not exist yet, run one push to `main` first so the Action creates it.

## 5. Automatic deployment flow

The workflow in `.github/workflows/deploy-website.yml` does this on every push to `main`:

1. Checkout code
2. Setup Node.js 20
3. Run `npm ci` inside `website/`
4. Build with `npm run build`
5. Deploy `website/dist` to `gh-pages` using `peaceiris/actions-gh-pages`

## 6. How to deploy updates

Every time you change the website, use:

```bash
git add .
git commit -m "Update website"
git push origin main
```

GitHub Actions will deploy automatically.

## 7. Expected public URL

For a project repository, GitHub Pages URL is typically:

`https://<your-github-username>.github.io/<repo-name>/`

For this repository, if owner/repo stay unchanged, it should look like:

`https://<owner>.github.io/Extra-Crispy/`

## 8. Why this matches your previous project

This setup mirrors your previous deployment style:

- CI-based deployment via GitHub Actions
- Static site build artifacts pushed to `gh-pages`
- Public hosting on GitHub Pages

The only practical difference is stack choice (this one uses Vite + React), while deployment mechanics remain the same.
