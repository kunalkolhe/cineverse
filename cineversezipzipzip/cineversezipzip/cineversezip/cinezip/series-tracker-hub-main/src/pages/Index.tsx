import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import MediaCard3D from "@/components/MediaCard3D";
import HeroCarousel from "@/components/HeroCarousel";
import MoodSelector from "@/components/MoodSelector";
import FloatingActionButton from "@/components/FloatingActionButton";
import { ContentSectionSkeleton } from "@/components/ShimmerSkeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchTmdbSeriesList } from "@/integrations/supabase/tmdb";
import { motion } from "framer-motion";
import { Globe, Film, Tv, Sparkles, TrendingUp, Star, Calendar, Clapperboard } from "lucide-react";

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

const sectionIcons: Record<string, React.ElementType> = {
  "Popular": TrendingUp,
  "Top Rated": Star,
  "Now Playing": Clapperboard,
  "Upcoming": Calendar,
  "Currently Airing": Tv,
  "On The Air": Calendar,
};

const ContentSection = ({
  title,
  type,
  mediaType,
  language,
  category,
  moodGenres,
}: {
  title: string;
  type: "trending" | "popular" | "top_rated" | "upcoming" | "now_playing";
  mediaType: "tv" | "movie" | "all";
  language: string;
  category: string;
  moodGenres?: number[];
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["tmdb", type, mediaType, language, category, moodGenres],
    queryFn: () =>
      fetchTmdbSeriesList(type, {
        mediaType,
        language,
        category,
        genres: moodGenres,
      }),
    staleTime: 1000 * 60 * 60,
    retry: 3,
    refetchOnWindowFocus: false,
  });

  const Icon = sectionIcons[title.split(" ").slice(0, 2).join(" ")] || TrendingUp;

  if (isLoading) {
    return <ContentSectionSkeleton />;
  }

  const items = data?.results || [];

  return (
    <motion.section 
      className="space-y-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Icon className="h-5 w-5 text-primary" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
      </div>

      {items.length === 0 ? (
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">No content</p>
            </div>
          ))}
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {items.slice(0, 12).map((item: any, index: number) => (
            <MediaCard3D key={`${item.id}-${item.media_type}`} item={item} index={index} />
          ))}
        </div>
      )}
    </motion.section>
  );
};

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodGenres, setMoodGenres] = useState<number[]>([]);

  const { data: heroData, isLoading: heroLoading } = useQuery({
    queryKey: ["tmdb", "trending", "all"],
    queryFn: () => fetchTmdbSeriesList("trending", { mediaType: "all" }),
    staleTime: 1000 * 60 * 60,
  });

  const handleMoodSelect = (moodId: string, genres: number[]) => {
    if (selectedMood === moodId) {
      setSelectedMood(null);
      setMoodGenres([]);
    } else {
      setSelectedMood(moodId);
      setMoodGenres(genres);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <HeroCarousel 
        items={heroData?.results || []} 
        isLoading={heroLoading} 
      />

      <div className="container mx-auto px-4 py-12 space-y-16">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-gradient"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                Discover CineVerse
              </motion.h1>
              <motion.p 
                className="text-muted-foreground max-w-2xl text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                Your universe of movies and series. Discover, track, and share your favorites with real-time data and personalized recommendations.
              </motion.p>
            </div>

            <motion.div 
              className="flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
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
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card rounded-2xl p-6"
          >
            <MoodSelector 
              selectedMood={selectedMood} 
              onMoodSelect={handleMoodSelect}
            />
          </motion.div>
        </motion.section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <TabsList className="grid w-full max-w-md grid-cols-3 glass p-1 rounded-xl">
              <TabsTrigger 
                value="all" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300"
              >
                <Sparkles className="h-4 w-4" />
                All
              </TabsTrigger>
              <TabsTrigger 
                value="movies" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300"
              >
                <Film className="h-4 w-4" /> Movies
              </TabsTrigger>
              <TabsTrigger 
                value="series" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300"
              >
                <Tv className="h-4 w-4" /> Series
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <div>
            <TabsContent value="all" className="space-y-16 mt-10">
              <ContentSection
                title="Popular Movies & Series"
                type="popular"
                mediaType="all"
                language={selectedLanguage}
                category={selectedCategory}
                moodGenres={moodGenres}
              />
              <ContentSection
                title="Top Rated"
                type="top_rated"
                mediaType="all"
                language={selectedLanguage}
                category={selectedCategory}
                moodGenres={moodGenres}
              />
              <ContentSection
                title="Now Playing & Airing"
                type="now_playing"
                mediaType="all"
                language={selectedLanguage}
                category={selectedCategory}
                moodGenres={moodGenres}
              />
            </TabsContent>

            <TabsContent value="movies" className="space-y-16 mt-10">
              <ContentSection
                title="Popular Movies"
                type="popular"
                mediaType="movie"
                language={selectedLanguage}
                category={selectedCategory}
                moodGenres={moodGenres}
              />
              <ContentSection
                title="Top Rated Movies"
                type="top_rated"
                mediaType="movie"
                language={selectedLanguage}
                category={selectedCategory}
                moodGenres={moodGenres}
              />
              <ContentSection
                title="Now Playing in Theaters"
                type="now_playing"
                mediaType="movie"
                language={selectedLanguage}
                category={selectedCategory}
                moodGenres={moodGenres}
              />
              <ContentSection
                title="Upcoming Movies"
                type="upcoming"
                mediaType="movie"
                language={selectedLanguage}
                category={selectedCategory}
                moodGenres={moodGenres}
              />
            </TabsContent>

            <TabsContent value="series" className="space-y-16 mt-10">
              <ContentSection
                title="Popular TV Series"
                type="popular"
                mediaType="tv"
                language={selectedLanguage}
                category={selectedCategory}
                moodGenres={moodGenres}
              />
              <ContentSection
                title="Top Rated Series"
                type="top_rated"
                mediaType="tv"
                language={selectedLanguage}
                category={selectedCategory}
                moodGenres={moodGenres}
              />
              <ContentSection
                title="Currently Airing"
                type="now_playing"
                mediaType="tv"
                language={selectedLanguage}
                category={selectedCategory}
                moodGenres={moodGenres}
              />
              <ContentSection
                title="On The Air"
                type="upcoming"
                mediaType="tv"
                language={selectedLanguage}
                category={selectedCategory}
                moodGenres={moodGenres}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <FloatingActionButton />

      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-xl mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                <Film className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">CineVerse</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Powered by TMDB. Built with love for movie enthusiasts.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
