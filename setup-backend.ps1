# PowerShell script to set up Supabase backend
# Run this script to deploy all Edge Functions and set up the database

Write-Host "🚀 Setting up Series Tracker Hub Backend" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "Checking Supabase CLI..." -ForegroundColor Yellow
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseInstalled) {
    Write-Host "Installing Supabase CLI..." -ForegroundColor Yellow
    npm install -g supabase
}

# Project reference (from your Supabase URL)
$PROJECT_REF = "bplfxmcvodpeugwqihdg"

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Set your TMDB API key as a secret:" -ForegroundColor White
Write-Host "   npx supabase secrets set TMDB_API_KEY=`"your_tmdb_api_key`" --project-ref $PROJECT_REF" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Deploy Edge Functions:" -ForegroundColor White
Write-Host "   npx supabase functions deploy tmdb-series --project-ref $PROJECT_REF" -ForegroundColor Gray
Write-Host "   npx supabase functions deploy tmdb-movie --project-ref $PROJECT_REF" -ForegroundColor Gray
Write-Host "   npx supabase functions deploy tmdb-discover --project-ref $PROJECT_REF" -ForegroundColor Gray
Write-Host "   npx supabase functions deploy tmdb-search --project-ref $PROJECT_REF" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Apply database migration:" -ForegroundColor White
Write-Host "   npx supabase db push --project-ref $PROJECT_REF" -ForegroundColor Gray
Write-Host ""
Write-Host "Or use the Supabase Dashboard to:" -ForegroundColor Yellow
Write-Host "   - Set secrets in Project Settings > Edge Functions > Secrets" -ForegroundColor Gray
Write-Host "   - Run SQL migration in SQL Editor" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""

