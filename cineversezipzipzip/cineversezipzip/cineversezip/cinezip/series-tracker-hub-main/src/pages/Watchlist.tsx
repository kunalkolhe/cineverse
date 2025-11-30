import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Film, Tv, Eye, BookmarkPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { normalizeImageUrl } from "@/lib/utils";
import { getWatchlistByStatus, removeFromWatchlist, WatchlistItem } from "@/lib/watchlist";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Watchlist = () => {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [filter, setFilter] = useState<"all" | "planned" | "watched">("all");

  useEffect(() => {
    checkAuth();
    loadWatchlist();
  }, [filter]);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const loadWatchlist = () => {
    const items = getWatchlistByStatus(filter);
    setWatchlist(items);
  };

  const handleRemove = (item: WatchlistItem) => {
    removeFromWatchlist(item.id, item.media_type);
    setWatchlist(watchlist.filter((i) => !(i.id === item.id && i.media_type === item.media_type)));
    toast.success("Removed from watchlist");
  };

  const plannedCount = getWatchlistByStatus("planned").length;
  const watchedCount = getWatchlistByStatus("watched").length;
  const allCount = plannedCount + watchedCount;

  if (allCount === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">My Watchlist</h1>
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-lg">
                Your watchlist is empty. Start adding movies and series to track them!
              </p>
              <Button className="mt-4" onClick={() => navigate("/")}>
                Browse Content
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">My Watchlist</h1>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "planned" | "watched")}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All ({allCount})
            </TabsTrigger>
            <TabsTrigger value="planned" className="flex items-center gap-2">
              <BookmarkPlus className="h-4 w-4" /> Plan to Watch ({plannedCount})
            </TabsTrigger>
            <TabsTrigger value="watched" className="flex items-center gap-2">
              <Eye className="h-4 w-4" /> Already Watched ({watchedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            {watchlist.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground text-lg">
                    {filter === "planned" && "No items in your plan to watch list."}
                    {filter === "watched" && "No items marked as watched yet."}
                    {filter === "all" && "Your watchlist is empty."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {watchlist.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${item.media_type}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden hover:scale-[1.02] transition-transform border-border group relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80"
                        onClick={() => handleRemove(item)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className={`absolute top-2 left-2 z-10 px-2 py-1 rounded text-xs font-medium ${
                        item.status === "watched" 
                          ? "bg-green-600 text-white" 
                          : "bg-blue-600 text-white"
                      }`}>
                        {item.status === "watched" ? "Watched" : "Plan to Watch"}
                      </div>
                      <Link to={`/${item.media_type === "movie" ? "movie" : "series"}/${item.id}`}>
                        <CardContent className="p-0">
                          <div className="aspect-[2/3] relative">
                            {normalizeImageUrl(item.poster_path) ? (
                              <img
                                src={normalizeImageUrl(item.poster_path)!}
                                alt={item.name}
                                className="h-full w-full object-cover group-hover:brightness-110 transition-all"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-full w-full bg-muted flex items-center justify-center">
                                <p className="text-muted-foreground text-xs text-center px-2">
                                  {item.name}
                                </p>
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 space-y-1">
                              <p className="text-xs font-semibold text-white line-clamp-2">
                                {item.name}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-white/80">
                                <span>⭐ {item.vote_average?.toFixed(1) || "N/A"}</span>
                                <span className="uppercase text-[9px] flex items-center gap-1">
                                  {item.media_type === "movie" ? (
                                    <>
                                      <Film className="h-3 w-3" /> Movie
                                    </>
                                  ) : (
                                    <>
                                      <Tv className="h-3 w-3" /> TV
                                    </>
                                  )}
                                </span>
                                {item.year && <span>{item.year}</span>}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Watchlist;
