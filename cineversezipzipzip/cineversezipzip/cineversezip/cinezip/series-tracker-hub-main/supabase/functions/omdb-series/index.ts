import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OMDB_BASE_URL = "https://www.omdbapi.com/";
const OMDB_API_KEY = "6f1351b6";

interface RequestBody {
  seriesId: string; // IMDb ID (e.g., "tt0944947")
  sync?: boolean;
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

    const { seriesId, sync = false }: RequestBody = await req.json();

    if (!seriesId) {
      return new Response(
        JSON.stringify({ error: "seriesId is required" }),
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
    let imdbId = seriesId.toString();
    if (!imdbId.startsWith("tt")) {
      imdbId = `tt${imdbId.padStart(7, "0")}`;
    }

    // Fetch series details from OMDB
    const url = `${OMDB_BASE_URL}?i=${imdbId}&apikey=${OMDB_API_KEY}&type=series&plot=full`;
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
        JSON.stringify({ error: omdbData.Error || "Series not found" }),
        { 
          status: 404, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders,
          } 
        }
      );
    }

    // Parse actors into cast array
    const parseActors = (actorsString: string) => {
      if (!actorsString || actorsString === "N/A") return [];
      return actorsString.split(",").map((actor, index) => ({
        id: index + 1,
        name: actor.trim(),
        character: "", // OMDB doesn't provide character names
        profile_path: null,
        order: index,
      }));
    };

    // Parse genres into array
    const parseGenres = (genreString: string) => {
      if (!genreString || genreString === "N/A") return [];
      return genreString.split(",").map((genre, index) => ({
        id: index + 1,
        name: genre.trim(),
      }));
    };

    // Create seasons array from totalSeasons
    const createSeasons = (totalSeasons: string | null) => {
      if (!totalSeasons || totalSeasons === "N/A") return [];
      const numSeasons = parseInt(totalSeasons) || 0;
      return Array.from({ length: numSeasons }, (_, i) => ({
        id: `season-${i + 1}`,
        season_number: i + 1,
        name: `Season ${i + 1}`,
        overview: "",
        poster_path: null,
        air_date: null,
        episode_count: 0, // OMDB doesn't provide episode count per season
        episodes: [], // Will be populated if we fetch episode data
      }));
    };

    const totalSeasons = omdbData.totalSeasons ? parseInt(omdbData.totalSeasons) : 0;
    const seasons = createSeasons(omdbData.totalSeasons);

    // Transform OMDB response to match expected format
    const seriesData = {
      id: parseInt(omdbData.imdbID?.replace("tt", "") || "0"),
      imdb_id: omdbData.imdbID,
      name: omdbData.Title,
      title: omdbData.Title,
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
      backdrop_path: null, // OMDB doesn't provide backdrop
      vote_average: parseFloat(omdbData.imdbRating) || 0,
      vote_count: parseInt(omdbData.imdbVotes?.replace(/,/g, "") || "0"),
      first_air_date: omdbData.Released || null,
      release_date: omdbData.Released || null,
      year: omdbData.Year,
      runtime: omdbData.Runtime,
      genre: omdbData.Genre,
      genres: parseGenres(omdbData.Genre),
      director: omdbData.Director,
      writer: omdbData.Writer,
      actors: omdbData.Actors,
      language: omdbData.Language,
      country: omdbData.Country,
      awards: omdbData.Awards,
      ratings: omdbData.Ratings || [],
      type: omdbData.Type,
      totalSeasons: totalSeasons,
      number_of_seasons: totalSeasons,
      number_of_episodes: 0, // OMDB doesn't provide total episode count
      media_type: "tv",
      // Cast information
      credits: {
        cast: parseActors(omdbData.Actors),
        crew: [],
      },
      // Seasons information
      seasons: seasons,
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
        totalSeasons: omdbData.totalSeasons,
        response: omdbData.Response,
      },
    };

    // If sync is enabled, save to database
    if (sync) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Upsert series
        const { error: seriesError } = await supabase
          .from("web_series")
          .upsert({
            id: seriesData.id,
            tmdb_id: seriesData.id,
            name: seriesData.name,
            overview: seriesData.overview,
            poster_path: seriesData.poster_path,
            backdrop_path: seriesData.backdrop_path,
            first_air_date: seriesData.first_air_date || null,
            vote_average: seriesData.vote_average || 0,
            vote_count: seriesData.vote_count || 0,
            popularity: seriesData.vote_average || 0,
            original_language: seriesData.language || "en",
            origin_country: seriesData.country ? [seriesData.country] : [],
            status: "Unknown",
            type: "tv",
            number_of_seasons: seriesData.totalSeasons || 0,
            number_of_episodes: 0,
            genres: seriesData.genre ? seriesData.genre.split(", ") : [],
            networks: [],
            created_by: [],
            last_synced_at: new Date().toISOString(),
          }, {
            onConflict: "tmdb_id",
          });

        if (seriesError) {
          console.error("Error syncing series:", seriesError);
        }
      } catch (syncError) {
        console.error("Error during sync:", syncError);
      }
    }

    return new Response(
      JSON.stringify(seriesData),
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
