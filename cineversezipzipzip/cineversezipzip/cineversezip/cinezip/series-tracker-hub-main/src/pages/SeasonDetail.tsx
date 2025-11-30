import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { fetchTmdbSeriesDetails } from "@/integrations/supabase/tmdb";
import { ArrowLeft, Play, Clock } from "lucide-react";
import { motion } from "framer-motion";

const SeasonDetail = () => {
  const { id, seasonNumber } = useParams<{ id: string; seasonNumber: string }>();
  const [watchedEpisodes, setWatchedEpisodes] = useState<Set<string>>(new Set());

  const { data: series, isLoading } = useQuery({
    queryKey: ["tmdb-series", id],
    queryFn: () => fetchTmdbSeriesDetails(id!),
    enabled: !!id,
  });

  useEffect(() => {
    loadWatchedEpisodes();
  }, [id, seasonNumber]);

  const loadWatchedEpisodes = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !id || !seasonNumber) return;

    // Load watched episodes for this season
    const { data: episodes } = await supabase
      .from("episodes")
      .select("id, episode_number, seasons!inner(season_number)")
      .eq("series_id", parseInt(id))
      .eq("seasons.season_number", parseInt(seasonNumber));

    if (episodes) {
      const { data: watchHistory } = await supabase
        .from("user_watch_history")
        .select("episode_id")
        .eq("user_id", user.id)
        .in("episode_id", episodes.map((e) => e.id));

      if (watchHistory) {
        setWatchedEpisodes(new Set(watchHistory.map((h) => h.episode_id)));
      }
    }
  };

  if (isLoading || !series) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const season = series.seasons?.find(
    (s: any) => s.season_number === parseInt(seasonNumber || "0")
  );

  if (!season) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">
                Season {seasonNumber} not found.
              </p>
              <Link to={`/series/${id}`}>
                <Button>Back to Series</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const episodes = season.episodes || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link to={`/series/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{series.name}</h1>
            <p className="text-muted-foreground">{season.name}</p>
          </div>
        </div>

        {episodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {episodes.map((episode: any, index: number) => (
              <motion.div
                key={episode.id || episode.episode_number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/series/${id}/season/${seasonNumber}/episode/${episode.episode_number}`}>
                  <Card className="hover:scale-[1.02] transition-transform cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold">{episode.episode_number}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold line-clamp-2">{episode.name}</h3>
                          {episode.air_date && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(episode.air_date).toLocaleDateString()}
                            </p>
                          )}
                          {episode.overview && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {episode.overview}
                            </p>
                          )}
                          {episode.runtime && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                              <Clock className="h-3 w-3" />
                              {episode.runtime} min
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Episode information for this season is not available yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SeasonDetail;

