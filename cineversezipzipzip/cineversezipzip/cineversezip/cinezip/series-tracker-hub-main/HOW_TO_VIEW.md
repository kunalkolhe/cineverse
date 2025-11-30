# 📺 Where to See Trending Section on Your Website

## 🏠 Home Page Location

The **Trending** section (and all other sections) are displayed on the **Home Page** of your website.

## 🚀 How to View It

### Step 1: Start Your Development Server

Open a terminal in your project directory and run:

```bash
npm run dev
```

Or if you're using a different package manager:

```bash
# Using yarn
yarn dev

# Using pnpm
pnpm dev
```

### Step 2: Open Your Browser

Once the server starts, you'll see a message like:

```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 3: Navigate to Home Page

Open your browser and go to:

**http://localhost:5173/**

This is the **root URL** (`/`) which shows the **Index page** (home page).

## 📋 What You'll See on the Home Page

The home page displays **4 sections** in this order:

1. **"Trending Now"** ← This is the trending section you're looking for!
2. **"Popular TV & Movies"**
3. **"Top Rated"**
4. **"Upcoming & Airing"**

Each section shows a grid of TV shows and movies with:
- Poster images
- Titles
- Ratings (⭐)
- Media type (TV/Movie)
- Year

## 🎯 Quick Access

- **Home Page (Trending)**: `http://localhost:5173/`
- **Search**: `http://localhost:5173/search`
- **Dashboard**: `http://localhost:5173/dashboard`
- **Watchlist**: `http://localhost:5173/watchlist`

## 🔍 If Trending Section is Empty

If you see blank images or no content in the trending section:

1. **Make sure Edge Functions are deployed:**
   ```bash
   npx supabase functions deploy omdb-discover --project-ref bplfxmcvodpeugwqihdg
   ```

2. **Check browser console (F12)** for any errors

3. **Verify the function is working** in Supabase Dashboard:
   - Go to Edge Functions
   - Check logs for `omdb-discover`
   - Look for any error messages

4. **Clear browser cache** and refresh the page

## 📱 Navigation

You can also access the home page by:
- Clicking the **logo/brand name** in the navbar
- Clicking **"Home"** link in the navbar (if available)
- Directly typing `/` in the URL

---

**The trending section is the first section you'll see when you visit the home page!** 🎉

