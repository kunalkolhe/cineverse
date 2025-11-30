import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { fetchTmdbSeriesDetails, fetchSeasonEpisodes } from "@/integrations/supabase/tmdb";
import { toast } from "sonner";
import { Check, Star, Clock, Calendar, Users, Eye, BookmarkPlus } from "lucide-react";
import { motion } from "framer-motion";
import { addToWatchlist, getItemStatus, removeFromWatchlist } from "@/lib/watchlist";

const SeriesDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [isWatched, setIsWatched] = useState(false);
  const [isPlanToWatch, setIsPlanToWatch] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [seasonsWithEpisodes, setSeasonsWithEpisodes] = useState<Map<number, any>>(new Map());

  const {
    data: series,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tmdb-series", id],
    queryFn: () => fetchTmdbSeriesDetails(id!, { sync: true }),
    enabled: !!id,
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    loadStoredStatus();
    loadSeasonsEpisodes();
  }, [id, series]);

  const loadSeasonsEpisodes = async () => {
    if (!series?.seasons || series.seasons.length === 0) return;

    const episodePromises = series.seasons.map(async (season: any) => {
      try {
        const seasonData = await fetchSeasonEpisodes(id!, season.season_number);
        return { seasonNumber: season.season_number, data: seasonData };
      } catch (error) {
        console.error(`Error fetching episodes for season ${season.season_number}:`, error);
        return { seasonNumber: season.season_number, data: null };
      }
    });

    const results = await Promise.all(episodePromises);
    const episodesMap = new Map<number, any>();

    results.forEach((result) => {
      if (result.data) {
        episodesMap.set(result.seasonNumber, result.data);
      }
    });

    setSeasonsWithEpisodes(episodesMap);
  };

  const loadStoredStatus = () => {
    if (!id) return;
    const status = getItemStatus(Number(id), "tv");
    setIsWatched(status === "watched");
    setIsPlanToWatch(status === "planned");
  };

  const handleMarkWatched = () => {
    if (!id || !series) return;
    const numId = Number(id);
    
    if (isWatched) {
      removeFromWatchlist(numId, "tv");
      setIsWatched(false);
      setIsPlanToWatch(false);
      toast.success("Removed from watched");
    } else {
      addToWatchlist({
        id: numId,
        media_type: "tv",
        status: "watched",
        name: series.name || "Unknown",
        poster_path: series.poster_path,
        vote_average: series.vote_average || 0,
        year: series.first_air_date?.substring(0, 4) || null,
      });
      setIsWatched(true);
      setIsPlanToWatch(false);
      toast.success("Marked as watched!");
    }
  };

  const handlePlanToWatch = () => {
    if (!id || !series) return;
    const numId = Number(id);
    
    if (isPlanToWatch) {
      removeFromWatchlist(numId, "tv");
      setIsPlanToWatch(false);
      setIsWatched(false);
      toast.success("Removed from watchlist");
    } else {
      addToWatchlist({
        id: numId,
        media_type: "tv",
        status: "planned",
        name: series.name || "Unknown",
        poster_path: series.poster_path,
        vote_average: series.vote_average || 0,
        year: series.first_air_date?.substring(0, 4) || null,
      });
      setIsPlanToWatch(true);
      setIsWatched(false);
      toast.success("Added to watchlist!");
    }
  };

  const handleRate = (rating: number) => {
    if (!id) return;
    const ratingKey = `cineverse_ratings`;
    try {
      const stored = localStorage.getItem(ratingKey);
      const ratings = stored ? JSON.parse(stored) : {};
      localStorage.setItem(ratingKey, JSON.stringify({ ...ratings, [`tv_${id}`]: rating }));
    } catch {
      localStorage.setItem(ratingKey, JSON.stringify({ [`tv_${id}`]: rating }));
    }
    setUserRating(rating);
    toast.success(`Rated ${rating}/10`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">Unable to load series details at this time.</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const trailer = series.videos?.results?.find((v: any) => v.site === "YouTube" && v.type === "Trailer");

  const episodeRuntime = series.episode_run_time?.[0];
  const runtimeDisplay = episodeRuntime ? `${episodeRuntime} min/episode` : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="relative">
        {series.backdrop_path && (
          <div className="absolute inset-0 h-[60vh] overflow-hidden">
            <img src={series.backdrop_path} alt={series.name} className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background" />
          </div>
        )}
        <div className="container mx-auto px-4 py-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-6"
          >
            {series.poster_path && (
              <img
                src={series.poster_path}
                alt={series.name}
                className="w-full md:w-80 h-auto rounded-lg border border-border"
              />
            )}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{series.name}</h1>
                <div className="flex flex-wrap gap-2 items-center text-muted-foreground">
                  <span>⭐ {series.vote_average?.toFixed(1) || "N/A"}</span>
                  {series.number_of_seasons && (
                    <>
                      <span>•</span>
                      <span>{series.number_of_seasons} seasons</span>
                    </>
                  )}
                  {series.number_of_episodes && series.number_of_episodes > 0 && (
                    <>
                      <span>•</span>
                      <span>{series.number_of_episodes} episodes</span>
                    </>
                  )}
                  {series.first_air_date && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(series.first_air_date).getFullYear()}
                      </span>
                    </>
                  )}
                  {runtimeDisplay && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {runtimeDisplay}
                      </span>
                    </>
                  )}
                </div>
                {series.status && (
                  <Badge variant="outline" className="mt-2">
                    {series.status}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {series.genres?.map((genre: any) => (
                  <Badge key={genre.id} variant="secondary">
                    {genre.name}
                  </Badge>
                ))}
              </div>

              <p className="text-lg leading-relaxed">{series.overview}</p>

              {series.tagline && <p className="text-muted-foreground italic">"{series.tagline}"</p>}

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleMarkWatched}
                  variant={isWatched ? "default" : "outline"}
                  className={isWatched ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                >
                  {isWatched ? <Check className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                  {isWatched ? "Already Watched" : "Mark as Watched"}
                </Button>
                <Button onClick={handlePlanToWatch} variant={isPlanToWatch ? "default" : "outline"}>
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  {isPlanToWatch ? "In Watchlist" : "Plan to Watch"}
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Your Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRate(rating)}
                      className={`p-2 rounded ${
                        userRating === rating ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <Star className="h-4 w-4" fill={userRating === rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {trailer && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Trailer</h2>
              <div className="aspect-video rounded-lg overflow-hidden border border-border">
                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${trailer.key}`} allowFullScreen />
              </div>
            </motion.div>
          )}

          <Tabs defaultValue="cast" className="mt-8">
            <TabsList>
              <TabsTrigger value="cast">Cast</TabsTrigger>
              <TabsTrigger value="seasons">Seasons</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>

            <TabsContent value="cast" className="space-y-4">
              {series.credits?.cast && series.credits.cast.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {series.credits.cast.slice(0, 18).map((member: any, index: number) => (
                    <Card key={member.id || index}>
                      <CardContent className="p-0">
                        {member.profile_path ? (
                          <img
                            src={member.profile_path}
                            alt={member.name}
                            className="w-full aspect-[2/3] object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center rounded-t-lg">
                            <Users className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="p-2">
                          <p className="text-sm font-medium line-clamp-1">{member.name}</p>
                          {member.character && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{member.character}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No cast information available.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="seasons" className="space-y-4">
              {series.seasons && series.seasons.length > 0 ? (
                series.seasons.map((season: any) => {
                  const seasonEpisodes = seasonsWithEpisodes.get(season.season_number);
                  const episodes = seasonEpisodes?.episodes || season.episodes || [];

                  return (
                    <Card key={season.id || season.season_number}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {season.poster_path && (
                            <img src={season.poster_path} alt={season.name} className="w-24 h-32 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{season.name || `Season ${season.season_number}`}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {episodes.length || season.episode_count || 0} episodes •{" "}
                                  {season.air_date ? new Date(season.air_date).getFullYear() : "TBA"}
                                </p>
                              </div>
                              <Link to={`/series/${id}/season/${season.season_number}`}>
                                <Button variant="outline" size="sm">
                                  View All Episodes
                                </Button>
                              </Link>
                            </div>
                            {season.overview && <p className="text-sm mt-2 line-clamp-2">{season.overview}</p>}
                            {episodes.length > 0 && (
                              <div className="mt-4 space-y-2">
                                <p className="text-sm font-medium">Episodes ({episodes.length}):</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                  {episodes.slice(0, 12).map((episode: any) => (
                                    <Link
                                      key={episode.id || episode.episode_number}
                                      to={`/series/${id}/season/${season.season_number}/episode/${episode.episode_number}`}
                                    >
                                      <div className="p-2 border border-border rounded hover:bg-muted transition-colors cursor-pointer">
                                        <p className="text-xs font-medium">Ep {episode.episode_number}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{episode.name}</p>
                                        {episode.runtime && (
                                          <p className="text-[10px] text-muted-foreground mt-1">{episode.runtime} min</p>
                                        )}
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No season information available.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {series.images?.backdrops?.slice(0, 12).map((img: any, index: number) => (
                  <img
                    key={index}
                    src={`https://image.tmdb.org/t/p/w780${img.file_path}`}
                    alt={`${series.name} backdrop ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border border-border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                ))}
              </div>
              {(!series.images?.backdrops || series.images.backdrops.length === 0) && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No images available.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;
