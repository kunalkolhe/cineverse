import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { fetchTmdbMovieDetails } from "@/integrations/supabase/tmdb";
import { toast } from "sonner";
import { Check, Star, Clock, Calendar, Users, Eye, BookmarkPlus, DollarSign, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { addToWatchlist, getItemStatus, removeFromWatchlist } from "@/lib/watchlist";
import { cn } from "@/lib/utils";
import { ShimmerSkeleton } from "@/components/ShimmerSkeleton";

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [isWatched, setIsWatched] = useState(false);
  const [isPlanToWatch, setIsPlanToWatch] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  const {
    data: movie,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tmdb-movie", id],
    queryFn: () => fetchTmdbMovieDetails(id!),
    enabled: !!id,
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    loadStoredStatus();
  }, [id]);

  const loadStoredStatus = () => {
    if (!id) return;
    const status = getItemStatus(Number(id), "movie");
    setIsWatched(status === "watched");
    setIsPlanToWatch(status === "planned");
  };

  const handleMarkWatched = () => {
    if (!id || !movie) return;
    const numId = Number(id);
    
    if (isWatched) {
      removeFromWatchlist(numId, "movie");
      setIsWatched(false);
      setIsPlanToWatch(false);
      toast.success("Removed from watched");
    } else {
      addToWatchlist({
        id: numId,
        media_type: "movie",
        status: "watched",
        name: movie.title || "Unknown",
        poster_path: movie.poster_path,
        vote_average: movie.vote_average || 0,
        year: movie.release_date?.substring(0, 4) || null,
      });
      setIsWatched(true);
      setIsPlanToWatch(false);
      toast.success("Marked as watched!");
    }
  };

  const handlePlanToWatch = () => {
    if (!id || !movie) return;
    const numId = Number(id);
    
    if (isPlanToWatch) {
      removeFromWatchlist(numId, "movie");
      setIsPlanToWatch(false);
      setIsWatched(false);
      toast.success("Removed from watchlist");
    } else {
      addToWatchlist({
        id: numId,
        media_type: "movie",
        status: "planned",
        name: movie.title || "Unknown",
        poster_path: movie.poster_path,
        vote_average: movie.vote_average || 0,
        year: movie.release_date?.substring(0, 4) || null,
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
      localStorage.setItem(ratingKey, JSON.stringify({ ...ratings, [`movie_${id}`]: rating }));
    } catch {
      localStorage.setItem(ratingKey, JSON.stringify({ [`movie_${id}`]: rating }));
    }
    setUserRating(rating);
    toast.success(`Rated ${rating}/10`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="relative h-[60vh] overflow-hidden">
          <ShimmerSkeleton className="w-full h-full rounded-none" />
        </div>
        <div className="container mx-auto px-4 -mt-32 relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <ShimmerSkeleton className="w-full md:w-80 aspect-[2/3] rounded-2xl" />
            <div className="flex-1 space-y-4">
              <ShimmerSkeleton className="h-12 w-3/4" />
              <ShimmerSkeleton className="h-6 w-1/2" />
              <ShimmerSkeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-4">Unable to load movie details at this time.</p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-primary to-accent"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const trailer = movie.videos?.results?.find((v: any) => v.site === "YouTube" && v.type === "Trailer");
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="relative">
        {movie.backdrop_path && (
          <div className="absolute inset-0 h-[70vh] overflow-hidden">
            <motion.img 
              src={movie.backdrop_path} 
              alt={movie.title} 
              className="w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
          </div>
        )}
        
        <div className="absolute inset-0 pointer-events-none bg-mesh-gradient opacity-30" />
        
        <div className="container mx-auto px-4 pt-12 pb-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row gap-8 items-start"
          >
            {movie.poster_path && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative group perspective-1000"
              >
                <div className="relative">
                  <img
                    src={movie.poster_path}
                    alt={movie.title}
                    className="w-full md:w-80 h-auto rounded-2xl shadow-2xl border border-white/10"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <motion.div
                  className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-100 -z-10"
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    background: `radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.3) 0%, transparent 70%)`
                  }}
                />
              </motion.div>
            )}
            
            <div className="flex-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
                  {movie.title}
                </h1>
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    {movie.vote_average?.toFixed(1)}
                  </span>
                  {runtime && (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-full glass text-white/80">
                      <Clock className="h-4 w-4" />
                      {runtime}
                    </span>
                  )}
                  {movie.release_date && (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-full glass text-white/80">
                      <Calendar className="h-4 w-4" />
                      {new Date(movie.release_date).getFullYear()}
                    </span>
                  )}
                  {movie.budget && movie.budget > 0 && (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-full glass text-white/80">
                      <DollarSign className="h-4 w-4" />
                      ${(movie.budget / 1000000).toFixed(1)}M
                    </span>
                  )}
                </div>
                {movie.status && (
                  <Badge variant="outline" className="mt-3 border-primary/50">
                    {movie.status}
                  </Badge>
                )}
              </motion.div>

              <motion.div 
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {movie.genres?.map((genre: any, index: number) => (
                  <motion.div
                    key={genre.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                      {genre.name}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>

              <motion.p 
                className="text-lg leading-relaxed text-white/90"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {movie.overview}
              </motion.p>

              {movie.tagline && (
                <motion.p 
                  className="text-muted-foreground italic text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  "{movie.tagline}"
                </motion.p>
              )}

              <motion.div 
                className="flex flex-wrap gap-3 pt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleMarkWatched}
                    size="lg"
                    className={cn(
                      "gap-2 rounded-xl",
                      isWatched 
                        ? "bg-green-600 hover:bg-green-700 text-white glow-success" 
                        : "glass border border-white/20 hover:bg-white/10"
                    )}
                  >
                    {isWatched ? <Check className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    {isWatched ? "Watched" : "Mark as Watched"}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={handlePlanToWatch} 
                    size="lg"
                    className={cn(
                      "gap-2 rounded-xl",
                      isPlanToWatch
                        ? "bg-primary hover:bg-primary/90 glow-primary"
                        : "glass border border-white/20 hover:bg-white/10"
                    )}
                  >
                    <BookmarkPlus className="h-5 w-5" />
                    {isPlanToWatch ? "In Watchlist" : "Add to Watchlist"}
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div 
                className="space-y-3 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-sm font-medium text-muted-foreground">Your Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <motion.button
                      key={rating}
                      onClick={() => handleRate(rating)}
                      whileHover={{ scale: 1.2, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "p-2 rounded-lg transition-all duration-300",
                        userRating && rating <= userRating 
                          ? "bg-yellow-500/20 text-yellow-400" 
                          : "bg-white/5 text-muted-foreground hover:bg-white/10"
                      )}
                    >
                      <Star className="h-5 w-5" fill={userRating && rating <= userRating ? "currentColor" : "none"} />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {trailer && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.5 }} 
              className="mt-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20">
                  <Play className="h-5 w-5 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold">Trailer</h2>
              </div>
              <div className="aspect-video rounded-2xl overflow-hidden glass shadow-2xl">
                <iframe 
                  className="w-full h-full" 
                  src={`https://www.youtube.com/embed/${trailer.key}`} 
                  allowFullScreen 
                />
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12"
          >
            <Tabs defaultValue="cast" className="w-full">
              <TabsList className="glass p-1 rounded-xl mb-6">
                <TabsTrigger 
                  value="cast"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Cast
                </TabsTrigger>
                <TabsTrigger 
                  value="crew"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6"
                >
                  Crew
                </TabsTrigger>
                <TabsTrigger 
                  value="images"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-6"
                >
                  Images
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cast" className="space-y-4">
                {movie.credits?.cast && movie.credits.cast.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {movie.credits.cast.slice(0, 18).map((member: any, index: number) => (
                      <motion.div
                        key={member.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Card className="overflow-hidden glass-card group hover:border-primary/30 transition-all duration-300">
                          <CardContent className="p-0">
                            {member.profile_path ? (
                              <img
                                src={member.profile_path}
                                alt={member.name}
                                className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center">
                                <Users className="h-8 w-8 text-muted-foreground/30" />
                              </div>
                            )}
                            <div className="p-3 space-y-1">
                              <p className="text-sm font-medium line-clamp-1">{member.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{member.character}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="glass-card">
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No cast information available.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="crew" className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {movie.credits?.crew
                    ?.filter((c: any) => c.job === "Director" || c.job === "Producer" || c.job === "Writer")
                    .slice(0, 12)
                    .map((member: any, index: number) => (
                      <motion.div
                        key={`${member.id}-${member.job}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Card className="glass-card hover:border-primary/30 transition-all duration-300">
                          <CardContent className="p-4">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.job}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {movie.images?.backdrops?.slice(0, 12).map((img: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="group"
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w780${img.file_path}`}
                        alt={`${movie.title} backdrop ${index + 1}`}
                        className="w-full h-48 object-cover rounded-xl border border-border/50 group-hover:border-primary/30 transition-all duration-300 group-hover:scale-[1.02]"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </motion.div>
                  ))}
                </div>
                {(!movie.images?.backdrops || movie.images.backdrops.length === 0) && (
                  <Card className="glass-card">
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No images available.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
