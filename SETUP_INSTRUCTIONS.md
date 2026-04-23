# Complete Setup Instructions

Your portfolio is currently running in Figma Make. Here's how to get it to GitHub and deployed on Vercel.

## Option 1: Download & Upload (Recommended - Takes 5 minutes)

1. **Download all source files from this Figma Make environment**
   - All your code is in `/workspaces/default/code`
   - Download the `src/` folder, `package.json`, `vite.config.ts`, `postcss.config.mjs`, and `.gitignore`

2. **Clone your GitHub repo locally:**
   ```bash
   git clone https://github.com/shlok1806/shlok-portfolio.git
   cd shlok-portfolio
   ```

3. **Copy all downloaded files into the cloned repo**

4. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add complete portfolio source code"
   git push origin main
   ```

5. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"
   - Select `shlok1806/shlok-portfolio`
   - Click "Deploy"
   
Your site will be live at a Vercel URL in ~2 minutes!

## Option 2: Using the Figma Make GitHub Integration

If Figma Make has a "Deploy to GitHub" or "Sync to GitHub" button, use that to automatically push all files.

## What's Already on GitHub

The following files are already uploaded:
- `.gitignore`
- `README.md`
- `package.json`
- `vite.config.ts`
- `postcss.config.mjs`
- `DEPLOY.md`
- `src/styles/` (all CSS files)
- `src/app/App.tsx`
- `src/app/Root.tsx`
- `src/app/routes.ts`

## What Still Needs to be Uploaded

- `src/app/pages/Home.tsx` - Main portfolio page
- `src/app/data/records.ts` - All your project data
- `src/app/components/` - All components (LoadingScreen, Navigation, VinylDetail, etc.)
- `src/app/context/EraContext.tsx`
- `src/app/hooks/useSoundEffects.ts`

## Vercel Configuration

Vercel will auto-detect these settings:
- **Build Command:** `pnpm build`  
- **Output Directory:** `dist`
- **Install Command:** `pnpm install`

No environment variables needed!

## Need Help?

If you're stuck, the fastest path is:
1. Use Option 1 above (download & upload manually)
2. This guarantees all files make it to GitHub correctly
3. Then deploy to Vercel

Your portfolio is fully functional and ready to go live!