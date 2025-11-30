import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import AnimatedCounter from "@/components/AnimatedCounter";
import { Session } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Play, Clock, Star, TrendingUp, Eye, BookmarkPlus, Film, Tv, Sparkles, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { normalizeImageUrl } from "@/lib/utils";
import { getWatchlist, getWatchlistStats, WatchlistItem } from "@/lib/watchlist";
import MediaCard3D from "@/components/MediaCard3D";
import { cn } from "@/lib/utils";

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  gradient,
  delay = 0 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType;
  gradient: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 100 }}
    whileHover={{ y: -4, scale: 1.02 }}
  >
    <Card className={cn(
      "overflow-hidden border-border/50 relative group",
      "hover:border-primary/30 transition-all duration-500"
    )}>
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        gradient
      )} />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">
              <AnimatedCounter value={value} />
            </p>
          </div>
          <motion.div
            className={cn("p-3 rounded-xl", gradient)}
            whileHover={{ rotate: 10, scale: 1.1 }}
          >
            <Icon className="h-6 w-6 text-white" />
          </motion.div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    planned: 0,
    watched: 0,
    movies: 0,
    series: 0,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        loadUserData();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        loadUserData();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserData = () => {
    const items = getWatchlist();
    setWatchlist(items);
    setStats(getWatchlistStats());
  };

  const planToWatchItems = watchlist.filter((i) => i.status === "planned").slice(0, 6);
  const watchedItems = watchlist.filter((i) => i.status === "watched").slice(0, 6);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-8 w-8 text-primary" />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20 pointer-events-none" />
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"
          animate={{ x: [0, 50, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none"
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 py-12 space-y-12 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <BarChart3 className="h-6 w-6 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold text-gradient">My Dashboard</h1>
            </div>
            <p className="text-muted-foreground text-lg">Welcome back! Here's your activity overview.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatCard 
              title="Total in Watchlist" 
              value={stats.total}
              icon={Play}
              gradient="bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
              delay={0.1}
            />
            <StatCard 
              title="Plan to Watch" 
              value={stats.planned}
              icon={BookmarkPlus}
              gradient="bg-gradient-to-br from-yellow-500/20 to-orange-500/20"
              delay={0.2}
            />
            <StatCard 
              title="Already Watched" 
              value={stats.watched}
              icon={Eye}
              gradient="bg-gradient-to-br from-green-500/20 to-emerald-500/20"
              delay={0.3}
            />
            <StatCard 
              title="Movies / Series" 
              value={stats.movies + stats.series}
              icon={TrendingUp}
              gradient="bg-gradient-to-br from-purple-500/20 to-pink-500/20"
              delay={0.4}
            />
          </div>

          <div className="space-y-10">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20"
                    whileHover={{ scale: 1.1 }}
                  >
                    <BookmarkPlus className="h-5 w-5 text-yellow-500" />
                  </motion.div>
                  <h2 className="text-2xl font-semibold">Plan to Watch</h2>
                </div>
                {planToWatchItems.length > 0 && (
                  <Link 
                    to="/watchlist" 
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                  >
                    View All
                  </Link>
                )}
              </div>
              
              {planToWatchItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
                  {planToWatchItems.map((item, index) => (
                    <MediaCard3D
                      key={`${item.id}-${item.media_type}`}
                      item={{
                        id: item.id,
                        name: item.name,
                        poster_path: normalizeImageUrl(item.poster_path),
                        vote_average: item.vote_average,
                        media_type: item.media_type as "movie" | "tv",
                      }}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="glass-card border-dashed">
                    <CardContent className="p-12 text-center">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <BookmarkPlus className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      </motion.div>
                      <p className="text-muted-foreground mb-4">No items in your plan to watch list yet.</p>
                      <Link to="/">
                        <motion.button 
                          className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-medium shadow-glow"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Browse Content
                        </motion.button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Eye className="h-5 w-5 text-green-500" />
                  </motion.div>
                  <h2 className="text-2xl font-semibold">Already Watched</h2>
                </div>
                {watchedItems.length > 0 && (
                  <Link 
                    to="/watchlist" 
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                  >
                    View All
                  </Link>
                )}
              </div>
              
              {watchedItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
                  {watchedItems.map((item, index) => (
                    <MediaCard3D
                      key={`${item.id}-${item.media_type}`}
                      item={{
                        id: item.id,
                        name: item.name,
                        poster_path: normalizeImageUrl(item.poster_path),
                        vote_average: item.vote_average,
                        media_type: item.media_type as "movie" | "tv",
                      }}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="glass-card border-dashed">
                    <CardContent className="p-12 text-center">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Eye className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      </motion.div>
                      <p className="text-muted-foreground">No items marked as watched yet.</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
