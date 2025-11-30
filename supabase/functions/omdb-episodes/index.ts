import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OMDB_BASE_URL = "https://www.omdbapi.com/";
const OMDB_API_KEY = "6f1351b6";

interface RequestBody {
  seriesId: string; // IMDb ID (e.g., "tt0944947")
  seasonNumber: number;
}

serve(async (req) => {
  // CORS headers for all responses
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { seriesId, seasonNumber }: RequestBody = await req.json();

    if (!seriesId || !seasonNumber) {
      return new Response(
        JSON.stringify({ error: "seriesId and seasonNumber are required" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders,
          } 
        }
      );
    }

    // Ensure IMDb ID format
    let imdbId = seriesId.toString();
    if (!imdbId.startsWith("tt")) {
      imdbId = `tt${imdbId.padStart(7, "0")}`;
    }

    // First, get the series title using the IMDb ID
    const seriesUrl = `${OMDB_BASE_URL}?i=${imdbId}&apikey=${OMDB_API_KEY}&type=series`;
    const seriesResponse = await fetch(seriesUrl);
    
    if (!seriesResponse.ok) {
      throw new Error(`Failed to fetch series: ${seriesResponse.status}`);
    }
    
    const seriesData = await seriesResponse.json();
    if (seriesData.Response === "False") {
      throw new Error(seriesData.Error || "Series not found");
    }
    
    const seriesTitle = seriesData.Title;
    
    // Fetch season data from OMDB using series title
    const url = `${OMDB_BASE_URL}?t=${encodeURIComponent(seriesTitle)}&apikey=${OMDB_API_KEY}&Season=${seasonNumber}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`OMDB API error: ${response.status}`);
      return new Response(
        JSON.stringify({ error: `OMDB API error: ${response.status}` }),
        { 
          status: response.status, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders,
          } 
        }
      );
    }

    const omdbData = await response.json();

    if (omdbData.Response === "False") {
      return new Response(
        JSON.stringify({ error: omdbData.Error || "Season not found" }),
        { 
          status: 404, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders,
          } 
        }
      );
    }

    // Transform OMDB season response
    const episodes = (omdbData.Episodes || []).map((ep: any, index: number) => ({
      id: `episode-${seasonNumber}-${index + 1}`,
      episode_number: parseInt(ep.Episode) || (index + 1),
      name: ep.Title || `Episode ${index + 1}`,
      overview: "",
      still_path: null,
      air_date: ep.Released && ep.Released !== "N/A" ? ep.Released : null,
      runtime: null,
      vote_average: 0,
      tmdb_id: null,
      imdb_id: ep.imdbID || null,
    }));

    const seasonData = {
      id: `season-${seasonNumber}`,
      season_number: seasonNumber,
      name: `Season ${seasonNumber}`,
      overview: "",
      poster_path: null,
      air_date: episodes.length > 0 ? episodes[0]?.air_date : null,
      episode_count: episodes.length,
      episodes: episodes,
      series_id: parseInt(imdbId.replace("tt", "") || "0"),
      series_title: seriesTitle,
    };

    return new Response(
      JSON.stringify(seasonData),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders,
        } 
      }
    );
  }
});

