import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, LogOut, Moon, Sun, Film, Tv, Menu, X, Sparkles } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { useTheme } from "next-themes";
import { searchTmdbSuggestions } from "@/integrations/supabase/tmdb";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Suggestion {
  id: number;
  name?: string;
  title?: string;
  media_type: "tv" | "movie";
  poster_path: string | null;
  vote_average?: number;
  first_air_date?: string;
  release_date?: string;
}

const Navbar = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!supabase) return;
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const results = await searchTmdbSuggestions(searchQuery);
        setSuggestions(results as Suggestion[]);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    navigate("/auth");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setShowSuggestions(false);
    setSearchQuery("");
    const path = suggestion.media_type === "movie" ? "movie" : "series";
    navigate(`/${path}/${suggestion.id}`);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        isScrolled
          ? "glass border-b border-white/5 shadow-lg"
          : "bg-gradient-to-b from-background via-background/80 to-transparent"
      )}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <motion.div
              className="relative p-2 rounded-xl bg-gradient-to-br from-primary to-accent"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Film className="h-6 w-6 text-white" />
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ filter: "blur(8px)", zIndex: -1 }}
              />
            </motion.div>
            <span className="text-xl md:text-2xl font-bold text-gradient group-hover:opacity-80 transition-opacity">
              CineVerse
            </span>
          </Link>

          <div ref={searchRef} className="flex-1 max-w-xl relative hidden md:block">
            <form onSubmit={handleSearch}>
              <motion.div 
                className="relative"
                initial={false}
                animate={showSuggestions ? { scale: 1.02 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search movies & series..."
                  className={cn(
                    "pl-11 pr-4 h-11 rounded-xl transition-all duration-300",
                    "bg-secondary/50 border-border/50",
                    "focus:bg-secondary focus:border-primary/50 focus:shadow-glow",
                    "placeholder:text-muted-foreground/70"
                  )}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
              </motion.div>
            </form>

            <AnimatePresence>
              {showSuggestions && searchQuery.trim().length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 glass rounded-xl shadow-2xl max-h-[60vh] overflow-y-auto scrollbar-hide"
                >
                  {isLoadingSuggestions ? (
                    <div className="p-6 text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block"
                      >
                        <Sparkles className="h-6 w-6 text-primary" />
                      </motion.div>
                      <p className="text-muted-foreground mt-2">Searching...</p>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="py-2">
                      {suggestions.map((suggestion, index) => (
                        <motion.button
                          key={`${suggestion.id}-${suggestion.media_type}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full px-4 py-3 flex items-center gap-4 hover:bg-white/5 transition-colors text-left group"
                        >
                          {suggestion.poster_path ? (
                            <img
                              src={suggestion.poster_path}
                              alt={suggestion.name || suggestion.title}
                              className="w-12 h-16 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-muted rounded-lg flex items-center justify-center">
                              {suggestion.media_type === "movie" ? (
                                <Film className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Tv className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate group-hover:text-primary transition-colors">
                              {suggestion.name || suggestion.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10">
                                {suggestion.media_type === "movie" ? (
                                  <>
                                    <Film className="h-3 w-3" /> Movie
                                  </>
                                ) : (
                                  <>
                                    <Tv className="h-3 w-3" /> TV
                                  </>
                                )}
                              </span>
                              {(suggestion.first_air_date || suggestion.release_date) && (
                                <span>
                                  {(suggestion.first_air_date || suggestion.release_date)?.substring(0, 4)}
                                </span>
                              )}
                              {suggestion.vote_average && (
                                <span className="text-yellow-500">
                                  ★ {suggestion.vote_average.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative rounded-xl hover:bg-secondary"
                title="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  {theme === "dark" ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass w-48 p-2">
                  <DropdownMenuItem 
                    onClick={() => navigate("/dashboard")}
                    className="rounded-lg cursor-pointer"
                  >
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/watchlist")}
                    className="rounded-lg cursor-pointer"
                  >
                    Watchlist
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/history")}
                    className="rounded-lg cursor-pointer"
                  >
                    History
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/friends")}
                    className="rounded-lg cursor-pointer"
                  >
                    Friends
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/profile")}
                    className="rounded-lg cursor-pointer"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate("/settings")}
                    className="rounded-lg cursor-pointer"
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => navigate("/auth")}
                  className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-glow"
                >
                  Login
                </Button>
              </motion.div>
            )}

            <motion.div 
              className="md:hidden"
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-xl"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-border/50"
            >
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search movies & series..."
                    className="pl-11 h-11 rounded-xl bg-secondary/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
