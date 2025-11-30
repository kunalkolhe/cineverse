import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Plus, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/integrations/supabase/tmdb";

interface HeroItem {
  id: number;
  title?: string;
  name?: string;
  backdrop_path?: string;
  poster_path?: string;
  overview?: string;
  vote_average?: number;
  media_type?: "movie" | "tv";
  release_date?: string;
  first_air_date?: string;
}

interface HeroCarouselProps {
  items: HeroItem[];
  isLoading?: boolean;
}

const HeroCarousel = ({ items, isLoading = false }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const heroItems = items.slice(0, 5);

  const paginate = useCallback((newDirection: number) => {
    setCurrentIndex((prevIndex) => {
      if (newDirection > 0) {
        return prevIndex === heroItems.length - 1 ? 0 : prevIndex + 1;
      }
      return prevIndex === 0 ? heroItems.length - 1 : prevIndex - 1;
    });
  }, [heroItems.length]);

  useEffect(() => {
    if (!isAutoPlaying || heroItems.length <= 1) return;
    
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, paginate, heroItems.length]);

  if (isLoading) {
    return (
      <div className="relative w-full h-[70vh] min-h-[500px] bg-gradient-to-br from-background via-muted to-background overflow-hidden">
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-20 space-y-4">
            <div className="h-12 w-96 bg-muted rounded-lg animate-pulse" />
            <div className="h-6 w-64 bg-muted rounded-lg animate-pulse" />
            <div className="h-20 w-[600px] bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (heroItems.length === 0) return null;

  const currentItem = heroItems[currentIndex];
  const displayTitle = currentItem?.title || currentItem?.name || "Featured";
  const displayYear = currentItem?.release_date?.substring(0, 4) || currentItem?.first_air_date?.substring(0, 4);
  const backdropUrl = currentItem?.backdrop_path ? getImageUrl(currentItem.backdrop_path, "original") : null;

  return (
    <div 
      className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-background"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {backdropUrl ? (
            <div className="absolute inset-0">
              <motion.img
                src={backdropUrl}
                alt={displayTitle}
                className="w-full h-full object-cover"
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 6 }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
          )}

          <div className="absolute inset-0 pointer-events-none bg-mesh-gradient opacity-30" />

          <div className="absolute inset-0 flex items-end pointer-events-none">
            <div className="container mx-auto px-4 pb-24 pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-2xl space-y-5"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium backdrop-blur-sm">
                    {currentItem?.media_type === "movie" ? "Movie" : "TV Series"}
                  </span>
                  {displayYear && (
                    <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm backdrop-blur-sm">
                      {displayYear}
                    </span>
                  )}
                  {currentItem?.vote_average && currentItem.vote_average > 0 && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm backdrop-blur-sm">
                      <Star className="h-4 w-4 fill-current" />
                      {currentItem.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>

                <h1 
                  className="text-4xl md:text-6xl font-bold text-white leading-tight drop-shadow-lg"
                  style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
                >
                  {displayTitle}
                </h1>

                <p className="text-base md:text-lg text-white/80 line-clamp-3 leading-relaxed max-w-xl">
                  {currentItem?.overview || "Discover this amazing content on CineVerse."}
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Link to={`/${currentItem?.media_type === "movie" ? "movie" : "series"}/${currentItem?.id}`}>
                    <Button 
                      size="lg" 
                      className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground glow-primary group"
                    >
                      <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      View Details
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="gap-2 glass border-white/20 hover:bg-white/10 text-white"
                  >
                    <Plus className="h-5 w-5" />
                    Add to Watchlist
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {heroItems.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass hover:bg-white/20 transition-all duration-300 group z-20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full glass hover:bg-white/20 transition-all duration-300 group z-20"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        </>
      )}

      {heroItems.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                idx === currentIndex 
                  ? "w-8 bg-primary glow-primary" 
                  : "w-2 bg-white/30 hover:bg-white/50"
              )}
            />
          ))}
        </div>
      )}

      <motion.div 
        className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute bottom-20 left-20 w-64 h-64 bg-accent/20 rounded-full blur-[80px] pointer-events-none"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default HeroCarousel;
