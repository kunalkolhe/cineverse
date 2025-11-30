import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface RequestBody {
  movieId: number | string;
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

    const { movieId, language = "en-US" }: RequestBody = await req.json();

    if (!movieId) {
      return new Response(
        JSON.stringify({ error: "movieId is required" }),
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

    // Fetch movie details from TMDB
    let url = `${TMDB_BASE_URL}/movie/${movieId}?language=${language}&append_to_response=credits,images,videos`;
    
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
      return new Response(
        JSON.stringify({ error: `TMDB API error: ${response.status}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const movieData = await response.json();

    return new Response(
      JSON.stringify(movieData),
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

