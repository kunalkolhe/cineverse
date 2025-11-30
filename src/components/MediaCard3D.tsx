import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Film, Tv, Star, Plus, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaCard3DProps {
  item: {
    id: number;
    name?: string;
    title?: string;
    poster_path?: string | null;
    vote_average?: number;
    first_air_date?: string;
    release_date?: string;
    media_type?: "movie" | "tv";
    overview?: string;
  };
  index: number;
  onAddToWatchlist?: (item: any) => void;
  isInWatchlist?: boolean;
}

const MediaCard3D = ({ item, index, onAddToWatchlist, isInWatchlist = false }: MediaCard3DProps) => {
  const displayName = item.name || item.title || "Unknown";
  const displayYear = item.first_air_date?.substring(0, 4) || item.release_date?.substring(0, 4);
  const rating = item.vote_average?.toFixed(1) || "N/A";
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 50 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleQuickRating = (rating: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUserRating(rating);
    setShowRating(false);
  };

  const handleAddToList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToWatchlist) {
      onAddToWatchlist(item);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.03,
        type: "spring",
        stiffness: 100
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000 group"
    >
      <motion.div
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative"
      >
        <Link to={`/${item.media_type === "movie" ? "movie" : "series"}/${item.id}`}>
          <div className={cn(
            "relative overflow-hidden rounded-xl transition-all duration-500",
            "bg-gradient-to-br from-card via-card to-secondary/20",
            "border border-border/50 hover:border-primary/50",
            isHovered && "shadow-glow-lg"
          )}>
            <div className="aspect-[2/3] relative overflow-hidden">
              {item.poster_path ? (
                <motion.img
                  src={item.poster_path}
                  alt={displayName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  style={{ 
                    transform: isHovered ? "scale(1.1)" : "scale(1)",
                    transition: "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)"
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <div className="text-center p-4">
                    {item.media_type === "movie" ? (
                      <Film className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                    ) : (
                      <Tv className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                    )}
                    <p className="text-muted-foreground text-xs">{displayName}</p>
                  </div>
                </div>
              )}

              <div className={cn(
                "absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent",
                "opacity-60 group-hover:opacity-90 transition-opacity duration-300"
              )} />

              <motion.div 
                className="absolute top-3 right-3 flex gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -10 }}
                transition={{ duration: 0.2 }}
              >
                <motion.button
                  onClick={handleAddToList}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "p-2 rounded-full glass transition-all duration-300",
                    isInWatchlist ? "bg-primary text-primary-foreground glow-primary" : "hover:bg-primary/20"
                  )}
                >
                  {isInWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </motion.button>
                <motion.button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowRating(!showRating); }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "p-2 rounded-full glass transition-all duration-300",
                    userRating > 0 ? "bg-yellow-500/80 text-black" : "hover:bg-yellow-500/20"
                  )}
                >
                  <Star className={cn("h-4 w-4", userRating > 0 && "fill-current")} />
                </motion.button>
              </motion.div>

              {showRating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-14 right-3 glass rounded-lg p-2 flex gap-1"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      onClick={(e) => handleQuickRating(star, e)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1"
                    >
                      <Star 
                        className={cn(
                          "h-4 w-4 transition-colors",
                          star <= userRating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
                        )} 
                      />
                    </motion.button>
                  ))}
                </motion.div>
              )}

              <div className="absolute top-3 left-3">
                <motion.div 
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                    "glass",
                    Number(rating) >= 8 ? "text-green-400" :
                    Number(rating) >= 6 ? "text-yellow-400" : "text-red-400"
                  )}
                  whileHover={{ scale: 1.05 }}
                >
                  <Star className="h-3 w-3 fill-current" />
                  {rating}
                </motion.div>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-4 space-y-2">
                <motion.h3 
                  className="text-white font-bold text-sm line-clamp-2 drop-shadow-lg"
                  style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
                >
                  {displayName}
                </motion.h3>
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm">
                    {item.media_type === "movie" ? (
                      <>
                        <Film className="h-3 w-3" /> Movie
                      </>
                    ) : (
                      <>
                        <Tv className="h-3 w-3" /> Series
                      </>
                    )}
                  </span>
                  {displayYear && (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm">
                      {displayYear}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <motion.div
              className={cn(
                "absolute inset-0 rounded-xl pointer-events-none",
                "bg-gradient-to-tr from-primary/20 via-transparent to-accent/20",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              )}
            />

            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 pointer-events-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              </motion.div>
            )}
          </div>
        </Link>

        <motion.div
          className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
          style={{
            background: `radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.15) 0%, transparent 70%)`
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default MediaCard3D;
