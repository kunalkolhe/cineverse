import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface RequestBody {
  type: "trending" | "popular" | "top_rated" | "upcoming";
  page?: number;
  language?: string;
  mediaType?: "tv" | "movie" | "all";
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

    const {
      type,
      page = 1,
      language = "en-US",
      mediaType = "all",
    }: RequestBody = await req.json();

    if (!type) {
      return new Response(
        JSON.stringify({ error: "type is required" }),
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

    let url = "";
    let allResults: any[] = [];
    let totalPages = 0;
    let totalResults = 0;

    if (mediaType === "all") {
      // Fetch both TV and movies, then combine
      const [tvResults, movieResults] = await Promise.all([
        fetchList(type, "tv", page, language, tmdbApiKey, isV4Token),
        fetchList(type, "movie", page, language, tmdbApiKey, isV4Token),
      ]);

      // Combine and sort by popularity
      allResults = [...tvResults.results, ...movieResults.results]
        .map((item) => ({
          ...item,
          media_type: item.media_type || (item.name ? "tv" : "movie"),
        }))
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

      totalPages = Math.max(tvResults.total_pages, movieResults.total_pages);
      totalResults = tvResults.total_results + movieResults.total_results;
    } else {
      const results = await fetchList(type, mediaType, page, language, tmdbApiKey, isV4Token);
      allResults = results.results.map((item: any) => ({
        ...item,
        media_type: mediaType,
      }));
      totalPages = results.total_pages;
      totalResults = results.total_results;
    }

    return new Response(
      JSON.stringify({
        page,
        results: allResults,
        total_pages: totalPages,
        total_results: totalResults,
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

async function fetchList(
  type: string,
  mediaType: "tv" | "movie",
  page: number,
  language: string,
  tmdbApiKey: string,
  isV4Token: boolean
) {
  let url = "";

  if (type === "trending") {
    url = `${TMDB_BASE_URL}/trending/${mediaType}/day?language=${language}&page=${page}`;
  } else if (type === "popular") {
    url = `${TMDB_BASE_URL}/${mediaType}/popular?language=${language}&page=${page}`;
  } else if (type === "top_rated") {
    url = `${TMDB_BASE_URL}/${mediaType}/top_rated?language=${language}&page=${page}`;
  } else if (type === "upcoming") {
    if (mediaType === "movie") {
      url = `${TMDB_BASE_URL}/movie/upcoming?language=${language}&page=${page}`;
    } else {
      url = `${TMDB_BASE_URL}/tv/on_the_air?language=${language}&page=${page}`;
    }
  } else {
    throw new Error(`Unknown type: ${type}`);
  }

  // For v3 API key, append to URL. For v4 token, use Authorization header
  if (!isV4Token) {
    url += url.includes("?") ? `&api_key=${tmdbApiKey}` : `?api_key=${tmdbApiKey}`;
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

