import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface RequestBody {
  seriesId: number | string;
  language?: string;
  sync?: boolean;
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

    const { seriesId, language = "en-US", sync = false }: RequestBody = await req.json();

    if (!seriesId) {
      return new Response(
        JSON.stringify({ error: "seriesId is required" }),
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

    // Fetch series details from TMDB
    let url = `${TMDB_BASE_URL}/tv/${seriesId}?language=${language}&append_to_response=credits,images,videos,seasons`;
    
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

    const seriesData = await response.json();

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
            popularity: seriesData.popularity || 0,
            original_language: seriesData.original_language,
            origin_country: seriesData.origin_country || [],
            status: seriesData.status,
            type: "tv",
            number_of_seasons: seriesData.number_of_seasons || 0,
            number_of_episodes: seriesData.number_of_episodes || 0,
            genres: seriesData.genres || [],
            networks: seriesData.networks || [],
            created_by: seriesData.created_by || [],
            last_synced_at: new Date().toISOString(),
          }, {
            onConflict: "tmdb_id",
          });

        if (seriesError) {
          console.error("Error syncing series:", seriesError);
        } else {
          // Sync seasons
          if (seriesData.seasons && Array.isArray(seriesData.seasons)) {
            for (const season of seriesData.seasons) {
              // Get the series record to get the correct id
              const { data: seriesRecord } = await supabase
                .from("web_series")
                .select("id")
                .eq("tmdb_id", seriesData.id)
                .single();

              if (seriesRecord) {
                await supabase
                  .from("seasons")
                  .upsert({
                    series_id: seriesRecord.id,
                    season_number: season.season_number,
                    name: season.name,
                    overview: season.overview,
                    poster_path: season.poster_path,
                    air_date: season.air_date || null,
                    episode_count: season.episode_count || 0,
                    tmdb_id: season.id,
                  }, {
                    onConflict: "series_id,season_number",
                  });
              }
            }
          }

          // Sync cast members
          if (seriesData.credits?.cast && Array.isArray(seriesData.credits.cast)) {
            const { data: seriesRecord } = await supabase
              .from("web_series")
              .select("id")
              .eq("tmdb_id", seriesData.id)
              .single();

            if (seriesRecord) {
              // Delete existing cast for this series
              await supabase
                .from("cast_members")
                .delete()
                .eq("series_id", seriesRecord.id);

              // Insert new cast members
              const castMembers = seriesData.credits.cast.slice(0, 20).map((member: any, index: number) => ({
                series_id: seriesRecord.id,
                tmdb_id: member.id,
                name: member.name,
                character: member.character,
                profile_path: member.profile_path,
                order_index: index,
              }));

              if (castMembers.length > 0) {
                await supabase.from("cast_members").insert(castMembers);
              }
            }
          }
        }
      } catch (syncError) {
        console.error("Error during sync:", syncError);
        // Continue even if sync fails
      }
    }

    return new Response(
      JSON.stringify(seriesData),
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

