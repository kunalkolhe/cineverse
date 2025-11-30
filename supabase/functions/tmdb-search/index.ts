import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface RequestBody {
  query: string;
  page?: number;
  language?: string;
}

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        },
      });
    }

    const { query, page = 1, language = "en-US" }: RequestBody = await req.json();

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "query is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get TMDB API key from Supabase secrets
    const tmdbApiKey = Deno.env.get("TMDB_API_KEY");
    if (!tmdbApiKey) {
      return new Response(
        JSON.stringify({ error: "TMDB_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Determine if it's a v4 token (starts with eyJ) or v3 API key
    const isV4Token = tmdbApiKey.startsWith("eyJ");

    // Search both TV and movies
    const [tvResults, movieResults] = await Promise.all([
      searchMedia("tv", query, page, language, tmdbApiKey, isV4Token),
      searchMedia("movie", query, page, language, tmdbApiKey, isV4Token),
    ]);

    // Combine results
    const allResults = [
      ...tvResults.results.map((item: any) => ({ ...item, media_type: "tv" })),
      ...movieResults.results.map((item: any) => ({ ...item, media_type: "movie" })),
    ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    return new Response(
      JSON.stringify({
        page,
        results: allResults,
        total_pages: Math.max(tvResults.total_pages, movieResults.total_pages),
        total_results: tvResults.total_results + movieResults.total_results,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

async function searchMedia(
  mediaType: "tv" | "movie",
  query: string,
  page: number,
  language: string,
  tmdbApiKey: string,
  isV4Token: boolean
) {
  let url = `${TMDB_BASE_URL}/search/${mediaType}?query=${encodeURIComponent(query)}&language=${language}&page=${page}`;

  // For v3 API key, append to URL. For v4 token, use Authorization header
  if (!isV4Token) {
    url += `&api_key=${tmdbApiKey}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: isV4Token ? `Bearer ${tmdbApiKey}` : undefined,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`TMDB API error: ${response.status} - ${errorText}`);
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }

  return await response.json();
}

