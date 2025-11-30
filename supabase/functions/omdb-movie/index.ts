import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OMDB_BASE_URL = "https://www.omdbapi.com/";
const OMDB_API_KEY = "6f1351b6";

interface RequestBody {
  movieId: string; // IMDb ID (e.g., "tt1375666")
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

    const { movieId }: RequestBody = await req.json();

    if (!movieId) {
      return new Response(
        JSON.stringify({ error: "movieId is required" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders,
          } 
        }
      );
    }

    // Ensure IMDb ID format (tt followed by 7-8 digits)
    let imdbId = movieId.toString();
    if (!imdbId.startsWith("tt")) {
      imdbId = `tt${imdbId.padStart(7, "0")}`;
    }

    // Fetch movie details from OMDB
    const url = `${OMDB_BASE_URL}?i=${imdbId}&apikey=${OMDB_API_KEY}&type=movie&plot=full`;
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
        JSON.stringify({ error: omdbData.Error || "Movie not found" }),
        { 
          status: 404, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders,
          } 
        }
      );
    }

    // Transform OMDB response to match expected format
    const movieData = {
      id: parseInt(omdbData.imdbID?.replace("tt", "") || "0"),
      imdb_id: omdbData.imdbID,
      title: omdbData.Title,
      name: omdbData.Title,
      overview: omdbData.Plot || "",
      poster_path: (() => {
        if (!omdbData.Poster || omdbData.Poster === "N/A") return null;
        let posterUrl = omdbData.Poster.trim();
        if (posterUrl.startsWith("http://")) {
          posterUrl = posterUrl.replace("http://", "https://");
        } else if (!posterUrl.startsWith("https://") && !posterUrl.startsWith("http://")) {
          posterUrl = `https://${posterUrl}`;
        }
        return posterUrl.startsWith("https://") || posterUrl.startsWith("http://") ? posterUrl : null;
      })(),
      backdrop_path: null,
      vote_average: parseFloat(omdbData.imdbRating) || 0,
      vote_count: parseInt(omdbData.imdbVotes?.replace(/,/g, "") || "0"),
      release_date: omdbData.Released || null,
      year: omdbData.Year,
      runtime: omdbData.Runtime,
      genre: omdbData.Genre,
      director: omdbData.Director,
      writer: omdbData.Writer,
      actors: omdbData.Actors,
      language: omdbData.Language,
      country: omdbData.Country,
      awards: omdbData.Awards,
      ratings: omdbData.Ratings || [],
      type: omdbData.Type,
      media_type: "movie",
      // Additional OMDB fields
      omdb: {
        rated: omdbData.Rated,
        released: omdbData.Released,
        runtime: omdbData.Runtime,
        genre: omdbData.Genre,
        director: omdbData.Director,
        writer: omdbData.Writer,
        actors: omdbData.Actors,
        plot: omdbData.Plot,
        language: omdbData.Language,
        country: omdbData.Country,
        awards: omdbData.Awards,
        poster: omdbData.Poster,
        ratings: omdbData.Ratings,
        metascore: omdbData.Metascore,
        imdbRating: omdbData.imdbRating,
        imdbVotes: omdbData.imdbVotes,
        imdbID: omdbData.imdbID,
        type: omdbData.Type,
        boxOffice: omdbData.BoxOffice,
        production: omdbData.Production,
        website: omdbData.Website,
        response: omdbData.Response,
      },
    };

    return new Response(
      JSON.stringify(movieData),
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
