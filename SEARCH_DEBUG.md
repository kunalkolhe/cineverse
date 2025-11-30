# Search Functionality Debug Guide

## If search is not showing results:

### 1. Check Browser Console
Open browser DevTools (F12) and check the Console tab for any errors.

### 2. Verify Edge Function is Deployed
Make sure the `tmdb-search` edge function is deployed:
```bash
npx supabase functions deploy tmdb-search --project-ref your_project_ref
```

### 3. Check TMDB API Key
Verify the API key is set as a Supabase secret:
```bash
npx supabase secrets list --project-ref your_project_ref
```

If not set:
```bash
npx supabase secrets set TMDB_API_KEY="your_key" --project-ref your_project_ref
```

### 4. Test Edge Function Directly
You can test the edge function directly using curl or Postman:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/tmdb-search \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "breaking bad"}'
```

### 5. Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Search for something
4. Look for the `tmdb-search` request
5. Check if it returns 200 OK or an error

### 6. Common Issues

**Issue: "TMDB_API_KEY not configured"**
- Solution: Set the API key as a Supabase secret

**Issue: "CORS error"**
- Solution: Edge function should handle CORS, but check if it's deployed correctly

**Issue: "Function not found"**
- Solution: Deploy the edge function

**Issue: Empty results**
- Solution: Check if TMDB API is returning data (test with curl above)
- Make sure the API key has proper permissions

### 7. Enable Debug Logging
The search function now logs to console. Check browser console for:
- "Searching for: [query]"
- "Search results: [data]"
- Any error messages






