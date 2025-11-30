import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { fetchTmdbSeriesDetails, fetchSeasonEpisodes } from "@/integrations/supabase/tmdb";
import { toast } from "sonner";
import { Check, Play, ArrowLeft, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { normalizeImageUrl } from "@/lib/utils";

// OMDB provides direct poster URLs

const EpisodeDetail = () => {
  const { id, seasonNumber, episodeNumber } = useParams<{
    id: string;
    seasonNumber: string;
    episodeNumber: string;
  }>();
  const navigate = useNavigate();
  const [isWatched, setIsWatched] = useState(false);
  const [isLoadingEpisode, setIsLoadingEpisode] = useState(false);

  const { data: series, isLoading: isLoadingSeries } = useQuery({
    queryKey: ["tmdb-series", id],
    queryFn: () => fetchTmdbSeriesDetails(id!),
    enabled: !!id,
  });

  const { data: seasonData, isLoading: isLoadingSeason } = useQuery({
    queryKey: ["season-episodes", id, seasonNumber],
    queryFn: () => fetchSeasonEpisodes(id!, parseInt(seasonNumber || "1")),
    enabled: !!id && !!seasonNumber,
  });

  useEffect(() => {
    checkWatchStatus();
  }, [id, seasonNumber, episodeNumber]);

  const checkWatchStatus = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !id || !seasonNumber || !episodeNumber) return;

    // Find season first, then episode
    const { data: season } = await supabase
      .from("seasons")
      .select("id")
      .eq("series_id", parseInt(id))
      .eq("season_number", parseInt(seasonNumber))
      .single();

    if (!season) {
      setIsWatched(false);
      return;
    }

    // Find episode in database
    const { data: episode } = await supabase
      .from("episodes")
      .select("id")
      .eq("season_id", season.id)
      .eq("episode_number", parseInt(episodeNumber))
      .single();

    if (episode) {
      const { data: watchHistory } = await supabase
        .from("user_watch_history")
        .select("*")
        .eq("user_id", user.id)
        .eq("episode_id", episode.id)
        .single();

      setIsWatched(!!watchHistory);
    }
  };

  const handleMarkWatched = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !id || !seasonNumber || !episodeNumber) {
      toast.error("Please login");
      return;
    }

    setIsLoadingEpisode(true);

    // Find season first
    const { data: season } = await supabase
      .from("seasons")
      .select("id")
      .eq("series_id", parseInt(id))
      .eq("season_number", parseInt(seasonNumber))
      .single();

    if (!season) {
      toast.error("Season not found. Please sync the series first.");
      setIsLoadingEpisode(false);
      return;
    }

    // Find episode
    const { data: existingEpisode } = await supabase
      .from("episodes")
      .select("id")
      .eq("season_id", season.id)
      .eq("episode_number", parseInt(episodeNumber))
      .single();

    if (existingEpisode) {
      if (isWatched) {
        const { error } = await supabase
          .from("user_watch_history")
          .delete()
          .eq("user_id", user.id)
          .eq("episode_id", existingEpisode.id);
        if (!error) {
          setIsWatched(false);
          toast.success("Removed from watch history");
        }
      } else {
        const { error } = await supabase.from("user_watch_history").insert({
          user_id: user.id,
          series_id: parseInt(id),
          episode_id: existingEpisode.id,
        });
        if (!error) {
          setIsWatched(true);
          toast.success("Marked as watched");
        }
      }
    } else {
      toast.error("Episode not found in database. Please sync series first.");
    }

    setIsLoadingEpisode(false);
  };

  if (isLoadingSeries || !series) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const season = series.seasons?.find(
    (s: any) => s.season_number === parseInt(seasonNumber || "0")
  );

  const episode = seasonData?.episodes?.find(
    (e: any) => e.episode_number === parseInt(episodeNumber || "0")
  ) || season?.episodes?.find(
    (e: any) => e.episode_number === parseInt(episodeNumber || "0")
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Button variant="ghost" onClick={() => navigate(`/series/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Series
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {normalizeImageUrl(season?.poster_path) && (
              <img
                src={normalizeImageUrl(season.poster_path)!}
                alt={season.name}
                className="w-full md:w-64 h-auto rounded-lg border border-border"
              />
            )}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">
                  {episode?.name || `${series.name} - Season ${seasonNumber}, Episode ${episodeNumber}`}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {series.name} • Season {seasonNumber}, Episode {episodeNumber}
                  {episode?.air_date && (
                    <> • {new Date(episode.air_date).toLocaleDateString()}</>
                  )}
                </p>
                {episode?.overview && (
                  <p className="text-lg leading-relaxed mt-4">{episode.overview}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleMarkWatched}
                  disabled={isLoadingEpisode}
                  variant={isWatched ? "default" : "outline"}
                >
                  {isWatched ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Watched
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Mark as Watched
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {episode && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Episode Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {episode.air_date && (
                      <div>
                        <p className="text-muted-foreground">Air Date</p>
                        <p className="font-medium">{new Date(episode.air_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {episode.runtime && (
                      <div>
                        <p className="text-muted-foreground">Runtime</p>
                        <p className="font-medium">{episode.runtime} minutes</p>
                      </div>
                    )}
                    {episode.vote_average > 0 && (
                      <div>
                        <p className="text-muted-foreground">Rating</p>
                        <p className="font-medium">⭐ {episode.vote_average.toFixed(1)}</p>
                      </div>
                    )}
                  </div>
                </div>
                {episode.still_path && (
                  <img
                    src={episode.still_path}
                    alt={episode.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
              </CardContent>
            </Card>
          )}
          {!episode && (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Episode details are loading. If this episode doesn't exist, it may not be available in the database yet.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EpisodeDetail;

