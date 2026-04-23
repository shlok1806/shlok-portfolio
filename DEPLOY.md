# Deployment Instructions

This portfolio is built with React + Vite and can be deployed to Vercel, Netlify, or GitHub Pages.

## Quick Deploy to Vercel (Recommended)

1. Push your code to this GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Add New Project"
4. Import this repository (`shlok1806/shlok-portfolio`)
5. Vercel will auto-detect the Vite configuration
6. Click "Deploy"

Your site will be live at `https://your-project-name.vercel.app` in ~2 minutes!

## Manual Git Setup

If you need to push code manually:

```bash
# Clone the repository
git clone https://github.com/shlok1806/shlok-portfolio.git
cd shlok-portfolio

# Copy all your source files to this directory
# Then:
git add .
git commit -m "Add portfolio source code"
git push origin main
```

## Build Commands

- **Install**: `pnpm install`
- **Dev**: `pnpm dev`
- **Build**: `pnpm build`
- **Output Directory**: `dist/`

## Environment Variables

No environment variables needed for this project.

## Notes

- Node.js 18+ required
- Uses pnpm as package manager
- Vite 6.3.5 for building
- React 18.3.1