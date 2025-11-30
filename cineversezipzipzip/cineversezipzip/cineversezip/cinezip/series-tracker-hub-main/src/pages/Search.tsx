import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import MediaCard3D from "@/components/MediaCard3D";
import { MediaCardSkeleton } from "@/components/ShimmerSkeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchTmdbSeries } from "@/integrations/supabase/tmdb";
import { Search as SearchIcon, Globe, Film, Tv, Sparkles, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "all", name: "All Languages" },
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "ru", name: "Russian" },
  { code: "ar", name: "Arabic" },
  { code: "tr", name: "Turkish" },
];

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "action", label: "Action" },
  { value: "adventure", label: "Adventure" },
  { value: "animation", label: "Animation" },
  { value: "comedy", label: "Comedy" },
  { value: "crime", label: "Crime" },
  { value: "documentary", label: "Documentary" },
  { value: "drama", label: "Drama" },
  { value: "family", label: "Family" },
  { value: "fantasy", label: "Fantasy" },
  { value: "history", label: "History" },
  { value: "horror", label: "Horror" },
  { value: "mystery", label: "Mystery" },
  { value: "romance", label: "Romance" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "thriller", label: "Thriller" },
  { value: "war", label: "War" },
  { value: "western", label: "Western" },
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(searchParams.get("lang") || "all");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("cat") || "all");
  const [mediaFilter, setMediaFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["tmdb-search", query, selectedLanguage, selectedCategory],
    queryFn: async () => {
      if (!query || query.trim().length === 0) {
        return { page: 1, results: [], total_pages: 0, total_results: 0 };
      }
      return searchTmdbSeries(query.trim(), {
        language: selectedLanguage,
        category: selectedCategory,
      });
    },
    enabled: query.trim().length > 2,
    staleTime: 1000 * 60 * 5,
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const q = searchParams.get("q");
    const lang = searchParams.get("lang") || "all";
    const cat = searchParams.get("cat") || "all";
    if (q && q !== query) {
      setQuery(q);
    }
    if (lang !== selectedLanguage) {
      setSelectedLanguage(lang);
    }
    if (cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery.length > 2) {
      setSearchParams({
        q: trimmedQuery,
        lang: selectedLanguage,
        cat: selectedCategory,
      });
    } else if (trimmedQuery.length > 0) {
      toast.info("Please enter at least 3 characters to search");
    }
  };

  useEffect(() => {
    if (query.trim().length > 2) {
      const currentQ = searchParams.get("q");
      const currentLang = searchParams.get("lang") || "all";
      const currentCat = searchParams.get("cat") || "all";

      if (currentQ !== query.trim() || currentLang !== selectedLanguage || currentCat !== selectedCategory) {
        setSearchParams({
          q: query.trim(),
          lang: selectedLanguage,
          cat: selectedCategory,
        });
      }
    }
  }, [selectedLanguage, selectedCategory]);

  const filteredResults = data?.results?.filter((item) => {
    if (mediaFilter === "all") return true;
    return item.media_type === mediaFilter;
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-30 pointer-events-none" />
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 py-12 space-y-10 relative">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-6"
          >
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-gradient">Search</h1>
              <p className="text-muted-foreground text-lg">Find your next favorite movie or series</p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <motion.div 
                className="relative max-w-2xl"
                whileFocus={{ scale: 1.01 }}
              >
                <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by title..."
                  className={cn(
                    "pl-12 pr-4 h-14 text-lg rounded-2xl transition-all duration-300",
                    "bg-secondary/50 border-border/50",
                    "focus:bg-secondary focus:border-primary/50 focus:shadow-glow"
                  )}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SlidersHorizontal className={cn(
                    "h-5 w-5 transition-colors",
                    showFilters ? "text-primary" : "text-muted-foreground"
                  )} />
                </motion.button>
              </motion.div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <div className="flex items-center gap-2 glass rounded-lg px-3 py-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger className="w-[160px] border-0 bg-transparent h-8">
                            <SelectValue placeholder="Language" />
                          </SelectTrigger>
                          <SelectContent className="glass">
                            {LANGUAGES.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="glass rounded-lg px-3 py-2">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="w-[180px] border-0 bg-transparent h-8">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent className="glass">
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {query.trim().length > 2 && data && data.results && data.results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Tabs value={mediaFilter} onValueChange={setMediaFilter} className="w-full max-w-md">
                  <TabsList className="grid w-full grid-cols-3 glass p-1 rounded-xl">
                    <TabsTrigger 
                      value="all"
                      className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300"
                    >
                      <Sparkles className="h-4 w-4" />
                      All ({data.results.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="movie" 
                      className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300"
                    >
                      <Film className="h-4 w-4" /> Movies ({data.results.filter((r) => r.media_type === "movie").length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tv" 
                      className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300"
                    >
                      <Tv className="h-4 w-4" /> Series ({data.results.filter((r) => r.media_type === "tv").length})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </motion.div>
            )}
          </motion.div>

          {query.length <= 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <SearchIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
              </motion.div>
              <p className="text-muted-foreground text-lg">Type at least 3 characters to search</p>
            </motion.div>
          )}

          {isLoading && query.length > 2 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {[...Array(12)].map((_, i) => (
                <MediaCardSkeleton key={i} />
              ))}
            </div>
          )}

          {error && query.length > 2 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <p className="text-muted-foreground">Unable to search. Please check your connection.</p>
            </motion.div>
          )}

          {!error && data && query.trim().length > 2 && (
            <>
              {data.total_results > 0 && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-muted-foreground"
                >
                  Found {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""}
                  {mediaFilter !== "all" && ` (filtered from ${data.total_results})`}
                </motion.p>
              )}
              {filteredResults.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card rounded-2xl p-12 text-center"
                >
                  <SearchIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-xl font-medium mb-2">No results found</p>
                  <p className="text-muted-foreground">
                    No results for "{query}". Try different keywords.
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                  {filteredResults.map((series, index) => (
                    <MediaCard3D 
                      key={`${series.id}-${series.media_type}-${index}`}
                      item={series}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
