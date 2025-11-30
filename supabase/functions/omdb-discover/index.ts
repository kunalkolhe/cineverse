import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OMDB_BASE_URL = "https://www.omdbapi.com/";
const OMDB_API_KEY = "6f1351b6";

// Popular titles for each category and language
// Using well-known titles that are guaranteed to be in OMDB
const POPULAR_TITLES: Record<string, Record<string, string[]>> = {
  trending: {
    all: [
      "Breaking Bad", "Game of Thrones", "The Walking Dead", "Stranger Things",
      "The Office", "Friends", "The Big Bang Theory", "How I Met Your Mother",
      "The Dark Knight", "Inception", "Interstellar", "The Matrix",
      "The Crown", "House of Cards", "Sherlock", "Doctor Who",
      "The Mandalorian", "The Witcher", "Chernobyl", "True Detective"
    ],
    hi: [
      "Sacred Games", "Scam 1992", "The Family Man", "Mirzapur",
      "Paatal Lok", "Delhi Crime", "Asur", "Breathe",
      "Dangal", "3 Idiots", "Lagaan", "Gully Boy",
      "Gangs of Wasseypur", "Queen", "Barfi!", "Zindagi Na Milegi Dobara",
      "Taare Zameen Par", "Swades", "Rang De Basanti", "Dil Chahta Hai"
    ],
    es: [
      "La Casa de Papel", "Narcos", "Elite", "Money Heist",
      "Vis a Vis", "Las Chicas del Cable", "El Ministerio del Tiempo", "Velvet",
      "Pan's Labyrinth", "The Secret in Their Eyes", "Y Tu Mamá También", "Amores Perros",
      "Cable Girls", "The Platform", "Mirage", "The Invisible Guest",
      "Roma", "The Orphanage", "Time Share", "The Skin I Live In"
    ],
    fr: [
      "Lupin", "Call My Agent!", "The Bureau", "Marseille",
      "Dix Pour Cent", "Versailles", "Spiral", "Braquo",
      "Amélie", "The Intouchables", "Blue Is the Warmest Color", "La Haine",
      "The Artist", "A Prophet", "The Class", "Cache",
      "Portrait of a Lady on Fire", "Raw", "Elle", "The Diving Bell and the Butterfly"
    ],
    ko: [
      "Squid Game", "Parasite", "Crash Landing on You", "Itaewon Class",
      "Kingdom", "Signal", "Stranger", "My Mister",
      "Oldboy", "Memories of Murder", "The Handmaiden", "Train to Busan",
      "The Wailing", "Burning", "I Saw the Devil", "A Taxi Driver",
      "The Host", "Snowpiercer", "The Man from Nowhere", "New World"
    ],
    ja: [
      "Attack on Titan", "Death Note", "One Piece", "Naruto",
      "Your Name", "Spirited Away", "My Neighbor Totoro", "Princess Mononoke",
      "Tokyo Story", "Seven Samurai", "Rashomon", "Grave of the Fireflies",
      "Akira", "Ghost in the Shell", "Perfect Blue", "Howl's Moving Castle",
      "The Tale of the Princess Kaguya", "The Wind Rises", "Monster", "Fullmetal Alchemist"
    ],
    zh: [
      "Crouching Tiger, Hidden Dragon", "Infernal Affairs", "Hero", "House of Flying Daggers",
      "The Untamed", "Nirvana in Fire", "Story of Yanxi Palace", "The Longest Day in Chang'an",
      "Farewell My Concubine", "In the Mood for Love", "Chungking Express", "Raise the Red Lantern",
      "The Grandmaster", "Ip Man", "Red Cliff", "The Wandering Earth"
    ],
    de: [
      "Dark", "Babylon Berlin", "The Lives of Others", "Downfall",
      "The White Ribbon", "Toni Erdmann", "Good Bye Lenin!", "Run Lola Run",
      "The Wave", "The Baader Meinhof Complex", "Head-On", "Victoria"
    ],
    pt: [
      "City of God", "Elite Squad", "3%", "The Mechanism",
      "Central Station", "The Second Mother", "Bacurau", "Aquarius",
      "Neighboring Sounds", "The Given Word", "Black Orpheus", "Pixote"
    ],
    it: [
      "Gomorrah", "The Young Pope", "My Brilliant Friend", "Suburra",
      "Life Is Beautiful", "Cinema Paradiso", "The Great Beauty", "Bicycle Thieves",
      "8½", "La Dolce Vita", "The Conformist", "The Best of Youth"
    ],
    ru: [
      "Leviathan", "Loveless", "The Return", "Stalker",
      "Solaris", "Andrei Rublev", "The Mirror", "Ivan's Childhood",
      "Brother", "Night Watch", "Day Watch", "The Irony of Fate"
    ],
    ar: [
      "The Yacoubian Building", "Cairo 678", "The Square", "Wadjda",
      "Omar", "Paradise Now", "Theeb", "Caramel",
      "West Beirut", "Where Do We Go Now?", "The Insult", "Capernaum"
    ],
    tr: [
      "Winter Sleep", "Once Upon a Time in Anatolia", "The Wild Pear Tree", "Distant",
      "Uzak", "Climates", "Three Monkeys", "The Edge of Heaven",
      "The Butterfly's Dream", "Miracle", "The Gift", "Commitment"
    ],
  },
  popular: {
    all: [
      "Friends", "The Office", "Breaking Bad", "Game of Thrones",
      "The Big Bang Theory", "Stranger Things", "The Walking Dead", "Lost",
      "The Matrix", "Titanic", "Avatar", "The Avengers",
      "The Crown", "House of Cards", "Sherlock", "Doctor Who",
      "The Mandalorian", "The Witcher", "Chernobyl", "True Detective",
      "Pulp Fiction", "Forrest Gump", "The Godfather", "Schindler's List"
    ],
    hi: [
      "Sacred Games", "Scam 1992", "The Family Man", "Mirzapur",
      "Paatal Lok", "Delhi Crime", "Asur", "Breathe",
      "Dangal", "3 Idiots", "Lagaan", "Gully Boy",
      "Gangs of Wasseypur", "Queen", "Barfi!", "Zindagi Na Milegi Dobara",
      "Taare Zameen Par", "Swades", "Rang De Basanti", "Dil Chahta Hai",
      "Bajrangi Bhaijaan", "PK", "Andhadhun", "Article 15"
    ],
    es: [
      "La Casa de Papel", "Narcos", "Elite", "Money Heist",
      "Vis a Vis", "Las Chicas del Cable", "El Ministerio del Tiempo", "Velvet",
      "Cable Girls", "The Platform", "Mirage", "The Invisible Guest",
      "Y Tu Mamá También", "Pan's Labyrinth", "The Secret in Their Eyes", "Amores Perros",
      "Roma", "The Orphanage", "Time Share", "The Skin I Live In"
    ],
    fr: [
      "Lupin", "Call My Agent!", "The Bureau", "Marseille",
      "Dix Pour Cent", "Versailles", "Spiral", "Braquo",
      "Amélie", "The Intouchables", "Blue Is the Warmest Color", "La Haine",
      "The Artist", "A Prophet", "The Class", "Cache",
      "Portrait of a Lady on Fire", "Raw", "Elle", "The Diving Bell and the Butterfly"
    ],
    ko: [
      "Squid Game", "Parasite", "Crash Landing on You", "Itaewon Class",
      "Kingdom", "Signal", "Stranger", "My Mister",
      "Oldboy", "Memories of Murder", "The Handmaiden", "Train to Busan",
      "The Wailing", "Burning", "I Saw the Devil", "A Taxi Driver",
      "The Host", "Snowpiercer", "The Man from Nowhere", "New World"
    ],
    ja: [
      "Attack on Titan", "Death Note", "One Piece", "Naruto",
      "Your Name", "Spirited Away", "My Neighbor Totoro", "Princess Mononoke",
      "Tokyo Story", "Seven Samurai", "Rashomon", "Grave of the Fireflies",
      "Akira", "Ghost in the Shell", "Perfect Blue", "Howl's Moving Castle",
      "The Tale of the Princess Kaguya", "The Wind Rises", "Monster", "Fullmetal Alchemist"
    ],
    zh: [
      "Crouching Tiger, Hidden Dragon", "Infernal Affairs", "Hero", "House of Flying Daggers",
      "The Untamed", "Nirvana in Fire", "Story of Yanxi Palace", "The Longest Day in Chang'an",
      "Farewell My Concubine", "In the Mood for Love", "Chungking Express", "Raise the Red Lantern",
      "The Grandmaster", "Ip Man", "Red Cliff", "The Wandering Earth"
    ],
    de: [
      "Dark", "Babylon Berlin", "The Lives of Others", "Downfall",
      "The White Ribbon", "Toni Erdmann", "Good Bye Lenin!", "Run Lola Run",
      "The Wave", "The Baader Meinhof Complex", "Head-On", "Victoria"
    ],
    pt: [
      "City of God", "Elite Squad", "3%", "The Mechanism",
      "Central Station", "The Second Mother", "Bacurau", "Aquarius",
      "Neighboring Sounds", "The Given Word", "Black Orpheus", "Pixote"
    ],
    it: [
      "Gomorrah", "The Young Pope", "My Brilliant Friend", "Suburra",
      "Life Is Beautiful", "Cinema Paradiso", "The Great Beauty", "Bicycle Thieves",
      "8½", "La Dolce Vita", "The Conformist", "The Best of Youth"
    ],
    ru: [
      "Leviathan", "Loveless", "The Return", "Stalker",
      "Solaris", "Andrei Rublev", "The Mirror", "Ivan's Childhood",
      "Brother", "Night Watch", "Day Watch", "The Irony of Fate"
    ],
    ar: [
      "The Yacoubian Building", "Cairo 678", "The Square", "Wadjda",
      "Omar", "Paradise Now", "Theeb", "Caramel",
      "West Beirut", "Where Do We Go Now?", "The Insult", "Capernaum"
    ],
    tr: [
      "Winter Sleep", "Once Upon a Time in Anatolia", "The Wild Pear Tree", "Distant",
      "Uzak", "Climates", "Three Monkeys", "The Edge of Heaven",
      "The Butterfly's Dream", "Miracle", "The Gift", "Commitment"
    ],
  },
  top_rated: {
    all: [
      "The Shawshank Redemption", "The Godfather", "The Dark Knight",
      "Pulp Fiction", "Fight Club", "Forrest Gump", "Inception",
      "Breaking Bad", "Game of Thrones", "The Wire", "The Sopranos", "Chernobyl",
      "The Godfather Part II", "Schindler's List", "12 Angry Men", "The Lord of the Rings",
      "Goodfellas", "The Matrix", "Star Wars", "The Silence of the Lambs"
    ],
    hi: [
      "3 Idiots", "Dangal", "Lagaan", "Taare Zameen Par",
      "Gangs of Wasseypur", "Zindagi Na Milegi Dobara", "Queen", "Barfi!",
      "Swades", "Rang De Basanti", "Dil Chahta Hai", "Bajrangi Bhaijaan",
      "PK", "Andhadhun", "Article 15", "Masaan"
    ],
    es: [
      "The Secret in Their Eyes", "Pan's Labyrinth", "Y Tu Mamá También",
      "Amores Perros", "The Motorcycle Diaries", "Biutiful", "Talk to Her",
      "Roma", "The Orphanage", "The Skin I Live In", "Volver",
      "All About My Mother", "The Spirit of the Beehive", "Viridiana", "The Discreet Charm of the Bourgeoisie"
    ],
    fr: [
      "Amélie", "The Intouchables", "Blue Is the Warmest Color", "La Haine",
      "The Artist", "A Prophet", "The Class", "Cache",
      "Portrait of a Lady on Fire", "Raw", "Elle", "The Diving Bell and the Butterfly",
      "The 400 Blows", "Breathless", "The Rules of the Game", "Children of Paradise"
    ],
    ko: [
      "Parasite", "Oldboy", "Memories of Murder", "The Handmaiden",
      "Train to Busan", "The Wailing", "Burning", "I Saw the Devil",
      "A Taxi Driver", "The Host", "Snowpiercer", "The Man from Nowhere",
      "New World", "The Chaser", "Mother", "The Yellow Sea"
    ],
    ja: [
      "Seven Samurai", "Tokyo Story", "Rashomon", "Spirited Away",
      "Your Name", "Princess Mononoke", "Grave of the Fireflies", "Akira",
      "Ghost in the Shell", "Perfect Blue", "Howl's Moving Castle", "The Wind Rises",
      "Ikiru", "Harakiri", "High and Low", "Yojimbo"
    ],
    zh: [
      "Farewell My Concubine", "In the Mood for Love", "Chungking Express", "Raise the Red Lantern",
      "The Grandmaster", "Ip Man", "Red Cliff", "The Wandering Earth",
      "Crouching Tiger, Hidden Dragon", "Hero", "House of Flying Daggers", "Infernal Affairs"
    ],
    de: [
      "The Lives of Others", "Downfall", "The White Ribbon", "Toni Erdmann",
      "Good Bye Lenin!", "Run Lola Run", "The Wave", "The Baader Meinhof Complex",
      "Head-On", "Victoria", "Dark", "Babylon Berlin"
    ],
    pt: [
      "City of God", "Central Station", "The Second Mother", "Bacurau",
      "Aquarius", "Neighboring Sounds", "The Given Word", "Black Orpheus",
      "Pixote", "Elite Squad", "3%", "The Mechanism"
    ],
    it: [
      "Life Is Beautiful", "Cinema Paradiso", "The Great Beauty", "Bicycle Thieves",
      "8½", "La Dolce Vita", "The Conformist", "The Best of Youth",
      "Gomorrah", "The Young Pope", "My Brilliant Friend", "Suburra"
    ],
    ru: [
      "Stalker", "Solaris", "Andrei Rublev", "The Mirror",
      "Ivan's Childhood", "Leviathan", "Loveless", "The Return",
      "Brother", "Night Watch", "Day Watch", "The Irony of Fate"
    ],
    ar: [
      "The Square", "Wadjda", "Omar", "Paradise Now",
      "Theeb", "Caramel", "West Beirut", "Where Do We Go Now?",
      "The Insult", "Capernaum", "The Yacoubian Building", "Cairo 678"
    ],
    tr: [
      "Winter Sleep", "Once Upon a Time in Anatolia", "The Wild Pear Tree", "Distant",
      "Uzak", "Climates", "Three Monkeys", "The Edge of Heaven",
      "The Butterfly's Dream", "Miracle", "The Gift", "Commitment"
    ],
  },
  upcoming: {
    all: [
      "Dune", "No Time to Die", "The Matrix Resurrections", "Spider-Man",
      "The Batman", "Top Gun: Maverick", "Black Widow", "Eternals",
      "Doctor Strange", "Thor", "Black Panther", "Avengers",
      "John Wick", "Fast & Furious", "Mission Impossible", "James Bond"
    ],
    hi: [
      "RRR", "Brahmastra", "Pathaan", "Animal",
      "Jawan", "Tiger 3", "Fighter", "Dunki",
      "Salaar", "Pushpa", "KGF", "Baahubali",
      "War", "Dhoom", "Don", "Sholay"
    ],
    es: [
      "El Camino", "The Platform", "Mirage", "The Invisible Guest",
      "Time Share", "The Bar", "The Skin I Live In", "The Orphanage",
      "Roma", "Y Tu Mamá También", "Pan's Labyrinth", "The Secret in Their Eyes",
      "Amores Perros", "The Motorcycle Diaries", "Biutiful", "Talk to Her"
    ],
    fr: [
      "Lupin Part 3", "The French Dispatch", "Annette", "Titane",
      "Petite Maman", "The Worst Person in the World", "Drive My Car", "Parallel Mothers",
      "Amélie", "The Intouchables", "Blue Is the Warmest Color", "La Haine",
      "The Artist", "A Prophet", "The Class", "Cache"
    ],
    ko: [
      "Parasite 2", "The Roundup", "Decision to Leave", "Broker",
      "The Witch: Part 2", "Hunt", "Emergency Declaration", "Alienoid",
      "Squid Game", "Crash Landing on You", "Itaewon Class", "Kingdom",
      "Signal", "Stranger", "My Mister", "Oldboy"
    ],
    ja: [
      "Your Name", "Spirited Away", "My Neighbor Totoro", "Princess Mononoke",
      "Attack on Titan", "Death Note", "One Piece", "Naruto",
      "Tokyo Story", "Seven Samurai", "Rashomon", "Grave of the Fireflies",
      "Akira", "Ghost in the Shell", "Perfect Blue", "Howl's Moving Castle"
    ],
    zh: [
      "The Wandering Earth", "The Grandmaster", "Ip Man", "Red Cliff",
      "Crouching Tiger, Hidden Dragon", "Hero", "House of Flying Daggers", "Infernal Affairs",
      "The Untamed", "Nirvana in Fire", "Story of Yanxi Palace", "The Longest Day in Chang'an"
    ],
    de: [
      "Dark", "Babylon Berlin", "The Lives of Others", "Downfall",
      "The White Ribbon", "Toni Erdmann", "Good Bye Lenin!", "Run Lola Run"
    ],
    pt: [
      "City of God", "Elite Squad", "3%", "The Mechanism",
      "Central Station", "The Second Mother", "Bacurau", "Aquarius"
    ],
    it: [
      "Gomorrah", "The Young Pope", "My Brilliant Friend", "Suburra",
      "Life Is Beautiful", "Cinema Paradiso", "The Great Beauty", "Bicycle Thieves"
    ],
    ru: [
      "Leviathan", "Loveless", "The Return", "Stalker",
      "Solaris", "Andrei Rublev", "The Mirror", "Ivan's Childhood"
    ],
    ar: [
      "The Yacoubian Building", "Cairo 678", "The Square", "Wadjda",
      "Omar", "Paradise Now", "Theeb", "Caramel"
    ],
    tr: [
      "Winter Sleep", "Once Upon a Time in Anatolia", "The Wild Pear Tree", "Distant",
      "Uzak", "Climates", "Three Monkeys", "The Edge of Heaven"
    ],
  },
};

const LANGUAGE_MAP: Record<string, string[]> = {
  all: [],
  en: ["english", "eng"],
  hi: ["hindi"],
  es: ["spanish", "espanol"],
  fr: ["french", "francais"],
  de: ["german", "deutsch"],
  ja: ["japanese"],
  ko: ["korean"],
  zh: ["chinese", "mandarin", "cantonese"],
  pt: ["portuguese"],
  it: ["italian"],
  ru: ["russian"],
  ar: ["arabic"],
  tr: ["turkish"],
};

const matchesLanguage = (langCode: string, itemLanguage: string) => {
  if (!langCode || langCode === "all") return true;
  if (!itemLanguage) return false;

  const normalized = itemLanguage.toLowerCase();
  const variants = LANGUAGE_MAP[langCode] || [langCode.toLowerCase()];
  return variants.some((variant) => normalized.includes(variant));
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  action: ["action"],
  adventure: ["adventure"],
  animation: ["animation", "animated"],
  biography: ["biography", "biopic"],
  comedy: ["comedy", "parody"],
  crime: ["crime"],
  documentary: ["documentary"],
  drama: ["drama"],
  family: ["family"],
  fantasy: ["fantasy"],
  history: ["history", "historical"],
  horror: ["horror"],
  mystery: ["mystery"],
  romance: ["romance", "romantic"],
  "sci-fi": ["sci-fi", "science fiction", "sci fi"],
  thriller: ["thriller", "suspense"],
  war: ["war"],
  western: ["western"],
};

const getCategoryKeywords = (category: string) => {
  if (!category || category === "all") return [];
  return CATEGORY_KEYWORDS[category] || [category];
};

interface RequestBody {
  type: "trending" | "popular" | "top_rated" | "upcoming";
  page?: number;
  mediaType?: "tv" | "movie" | "all";
  language?: string;
  category?: string;
}

serve(async (req) => {
  // CORS headers for all responses
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {

    const {
      type,
      page = 1,
      mediaType = "all",
      language = "all",
      category = "all",
    }: RequestBody = await req.json();

    if (!type) {
      return new Response(
        JSON.stringify({ error: "type is required" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders,
          } 
        }
      );
    }

    // Fetch details for each title with timeout
    const fetchWithTimeout = async (url: string, timeout = 5000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    const fetchCategoryResults = async () => {
      if (category === "all") return [];

      const keywordVariants = getCategoryKeywords(category);
      if (keywordVariants.length === 0) return [];

      const searchTypes =
        mediaType === "all" ? ["movie", "series"] : mediaType === "tv" ? ["series"] : ["movie"];

      const aggregatedResults: any[] = [];

      for (const type of searchTypes) {
        const searchTerm = encodeURIComponent(keywordVariants[0]);
        const searchUrl = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&type=${type}&s=${searchTerm}`;
        try {
          const searchResponse = await fetchWithTimeout(searchUrl, 5000);
          if (!searchResponse.ok) continue;

          const searchData = await searchResponse.json();
          if (searchData.Response !== "True" || !Array.isArray(searchData.Search)) continue;

          const detailedResults = await Promise.allSettled(
            searchData.Search.slice(0, 5).map(async (item: any) => {
              const detailUrl = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${item.imdbID}&plot=short`;
              const detailResponse = await fetchWithTimeout(detailUrl, 5000);
              if (!detailResponse.ok) {
                throw new Error(`HTTP ${detailResponse.status}`);
              }
              const detail = await detailResponse.json();
              if (detail.Response !== "True") return null;

              if (!matchesLanguage(language, detail.Language || "")) return null;

              if (
                category !== "all" &&
                !(detail.Genre || "").toLowerCase().includes(category.toLowerCase())
              ) {
                const keywords = getCategoryKeywords(category);
                if (
                  !keywords.some((kw) => (detail.Genre || "").toLowerCase().includes(kw.toLowerCase()))
                ) {
                  return null;
                }
              }

              let posterPath = null;
              if (detail.Poster && detail.Poster !== "N/A" && detail.Poster.trim() !== "") {
                let posterUrl = detail.Poster.trim();
                if (posterUrl.startsWith("http://")) {
                  posterUrl = posterUrl.replace("http://", "https://");
                } else if (!posterUrl.startsWith("https://") && !posterUrl.startsWith("http://")) {
                  // Add https:// if URL doesn't have a protocol
                  posterUrl = `https://${posterUrl}`;
                }
                if (posterUrl.startsWith("https://") || posterUrl.startsWith("http://")) {
                  posterPath = posterUrl;
                }
              }

              return {
                id: parseInt(detail.imdbID.replace("tt", "") || "0"),
                imdb_id: detail.imdbID,
                name: detail.Title,
                title: detail.Title,
                overview: detail.Plot || "",
                poster_path: posterPath,
                backdrop_path: null,
                vote_average: parseFloat(detail.imdbRating) || 0,
                vote_count: parseInt((detail.imdbVotes || "0").replace(/,/g, "")) || 0,
                first_air_date: detail.Released && detail.Released !== "N/A" ? detail.Released : null,
                release_date: detail.Released && detail.Released !== "N/A" ? detail.Released : null,
                year: detail.Year || "",
                media_type: type === "series" ? "tv" : "movie",
                popularity: parseFloat(detail.imdbRating) || 0,
                language: detail.Language || "",
                genre: detail.Genre || "",
                genres: detail.Genre
                  ? detail.Genre.split(",").map((g: string) => g.trim())
                  : [],
              };
            }),
          );

          detailedResults.forEach((res) => {
            if (res.status === "fulfilled" && res.value) {
              aggregatedResults.push(res.value);
            }
          });
        } catch (error) {
          console.error("Error fetching category results:", error);
        }
      }

      return aggregatedResults;
    };

    if (category !== "all") {
      const categoryResults = await fetchCategoryResults();
      if (categoryResults.length > 0) {
        categoryResults.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        return new Response(
          JSON.stringify({
            page: 1,
            results: categoryResults,
            total_pages: 1,
            total_results: categoryResults.length,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          },
        );
      }
    }

    // Get titles for this category and language
    const languageKey = language === "all" ? "all" : language;
    const titles =
      POPULAR_TITLES[type]?.[languageKey] ||
      POPULAR_TITLES[type]?.["all"] ||
      POPULAR_TITLES["popular"]["all"];
    const itemsPerPage = 20; // Increased from 10 to show more results
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageTitles = titles.slice(startIndex, endIndex);

    const results = await Promise.allSettled(
      pageTitles.map(async (title) => {
        try {
          // Try TV first if mediaType is 'all' or 'tv'
          if (mediaType === "all" || mediaType === "tv") {
            const tvUrl = `${OMDB_BASE_URL}?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}&type=series`;
            const tvResponse = await fetchWithTimeout(tvUrl, 5000);
            
            if (!tvResponse.ok) {
              throw new Error(`HTTP ${tvResponse.status}`);
            }
            
            const tvData = await tvResponse.json();

            if (tvData.Response === "True" && tvData.imdbID) {
              if (!matchesLanguage(language, tvData.Language || "")) {
                return null;
              }

              // Filter by category if specified
              if (category !== "all") {
                const genres = (tvData.Genre || "").toLowerCase();
                if (!genres.includes(category.toLowerCase())) {
                  return null;
                }
              }

              // Validate and fix poster URL
              let posterPath = null;
              if (tvData.Poster && tvData.Poster !== "N/A" && tvData.Poster.trim() !== "") {
                // Ensure HTTPS and valid URL
                let posterUrl = tvData.Poster.trim();
                if (posterUrl.startsWith("http://")) {
                  posterUrl = posterUrl.replace("http://", "https://");
                } else if (!posterUrl.startsWith("https://") && !posterUrl.startsWith("http://")) {
                  // Add https:// if URL doesn't have a protocol
                  posterUrl = `https://${posterUrl}`;
                }
                // Only set if it's a valid URL
                if (posterUrl.startsWith("https://") || posterUrl.startsWith("http://")) {
                  posterPath = posterUrl;
                }
              }

              return {
                id: parseInt(tvData.imdbID.replace("tt", "") || "0"),
                imdb_id: tvData.imdbID,
                name: tvData.Title,
                title: tvData.Title,
                overview: tvData.Plot || "",
                poster_path: posterPath,
                backdrop_path: null,
                vote_average: parseFloat(tvData.imdbRating) || 0,
                vote_count: parseInt((tvData.imdbVotes || "0").replace(/,/g, "")) || 0,
                first_air_date: tvData.Released && tvData.Released !== "N/A" ? tvData.Released : null,
                release_date: tvData.Released && tvData.Released !== "N/A" ? tvData.Released : null,
                year: tvData.Year || "",
                media_type: "tv",
                popularity: parseFloat(tvData.imdbRating) || 0,
                language: tvData.Language || "",
                genre: tvData.Genre || "",
                genres: tvData.Genre
                  ? tvData.Genre.split(",").map((g: string) => g.trim())
                  : [],
              };
            }
          }

          // Try movie if TV not found or mediaType is 'movie'
          if (mediaType === "all" || mediaType === "movie") {
            const movieUrl = `${OMDB_BASE_URL}?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}&type=movie`;
            const movieResponse = await fetchWithTimeout(movieUrl, 5000);
            
            if (!movieResponse.ok) {
              throw new Error(`HTTP ${movieResponse.status}`);
            }
            
            const movieData = await movieResponse.json();

            if (movieData.Response === "True" && movieData.imdbID) {
              if (!matchesLanguage(language, movieData.Language || "")) {
                return null;
              }

              // Filter by category if specified
              if (category !== "all") {
                const genres = (movieData.Genre || "").toLowerCase();
                if (!genres.includes(category.toLowerCase())) {
                  return null;
                }
              }

              // Validate and fix poster URL
              let posterPath = null;
              if (movieData.Poster && movieData.Poster !== "N/A" && movieData.Poster.trim() !== "") {
                // Ensure HTTPS and valid URL
                let posterUrl = movieData.Poster.trim();
                if (posterUrl.startsWith("http://")) {
                  posterUrl = posterUrl.replace("http://", "https://");
                } else if (!posterUrl.startsWith("https://") && !posterUrl.startsWith("http://")) {
                  // Add https:// if URL doesn't have a protocol
                  posterUrl = `https://${posterUrl}`;
                }
                // Only set if it's a valid URL
                if (posterUrl.startsWith("https://") || posterUrl.startsWith("http://")) {
                  posterPath = posterUrl;
                }
              }

              return {
                id: parseInt(movieData.imdbID.replace("tt", "") || "0"),
                imdb_id: movieData.imdbID,
                name: movieData.Title,
                title: movieData.Title,
                overview: movieData.Plot || "",
                poster_path: posterPath,
                backdrop_path: null,
                vote_average: parseFloat(movieData.imdbRating) || 0,
                vote_count: parseInt((movieData.imdbVotes || "0").replace(/,/g, "")) || 0,
                release_date: movieData.Released && movieData.Released !== "N/A" ? movieData.Released : null,
                year: movieData.Year || "",
                media_type: "movie",
                popularity: parseFloat(movieData.imdbRating) || 0,
                language: movieData.Language || "",
                genre: movieData.Genre || "",
                genres: movieData.Genre
                  ? movieData.Genre.split(",").map((g: string) => g.trim())
                  : [],
              };
            }
          }

          return null;
        } catch (error) {
          console.error(`Error fetching ${title}:`, error);
          return null;
        }
      })
    );

    // Extract successful results
    const validResults = results
      .filter((result) => result.status === "fulfilled" && result.value !== null)
      .map((result) => (result as PromiseFulfilledResult<any>).value);

    // Sort by rating/popularity
    validResults.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

    // Log for debugging
    console.log(`Fetched ${validResults.length} results for ${type} (page ${page})`);
    console.log(`Results with posters: ${validResults.filter(r => r.poster_path).length}`);

    return new Response(
      JSON.stringify({
        page,
        results: validResults,
        total_pages: Math.ceil(titles.length / itemsPerPage),
        total_results: validResults.length,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders,
        } 
      }
    );
  }
});

