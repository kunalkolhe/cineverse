import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OMDB_BASE_URL = "https://www.omdbapi.com/";
const OMDB_API_KEY = "6f1351b6";

interface RequestBody {
  query: string;
  page?: number;
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

    const { query, page = 1, language = "all", category = "all" }: RequestBody = await req.json();

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "query is required" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders,
          } 
        }
      );
    }

    // OMDB search returns up to 10 results per page
    const itemsPerPage = 10;
    const searchPage = Math.min(page, 10); // OMDB limits to 10 pages

    // Search both TV and movies using only "s=" parameter
    const [tvResults, movieResults] = await Promise.all([
      searchMedia("series", query, searchPage),
      searchMedia("movie", query, searchPage),
    ]);

    // Fetch full details for each result using "i=" parameter
    const allSearchResults = [...tvResults, ...movieResults];
    const detailedResults = await Promise.allSettled(
      allSearchResults.map(async (item: any) => {
        if (!item.imdbID) return null;
        try {
          const detailUrl = `${OMDB_BASE_URL}?i=${item.imdbID}&apikey=${OMDB_API_KEY}&plot=short`;
          const detailResponse = await fetch(detailUrl);
          if (!detailResponse.ok) return null;
          const detail = await detailResponse.json();
          if (detail.Response !== "True") return null;
          return detail;
        } catch (error) {
          console.error(`Error fetching details for ${item.imdbID}:`, error);
          return null;
        }
      })
    );

    // Helper function to convert IMDb ID to numeric ID
    const convertImdbId = (imdbId: string | undefined): number => {
      if (!imdbId) return 0;
      // Remove "tt" prefix if present
      const numericPart = imdbId.replace(/^tt/, "");
      const parsed = parseInt(numericPart, 10);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Helper function to normalize poster URL
    const normalizePosterUrl = (poster: string | undefined): string | null => {
      if (!poster || poster === "N/A" || poster.trim() === "") return null;
      let posterUrl = poster.trim();
      
      // Remove any leading/trailing whitespace
      posterUrl = posterUrl.trim();
      
      // Handle protocol
      if (posterUrl.startsWith("http://")) {
        posterUrl = posterUrl.replace("http://", "https://");
      } else if (!posterUrl.startsWith("https://") && !posterUrl.startsWith("http://")) {
        // If it starts with //, add https:
        if (posterUrl.startsWith("//")) {
          posterUrl = `https:${posterUrl}`;
        } else {
          posterUrl = `https://${posterUrl}`;
        }
      }
      
      // Validate URL format
      try {
        new URL(posterUrl);
        return posterUrl;
      } catch {
        // If URL is invalid, return null
        return null;
      }
    };

    // Language matching function (same as omdb-discover)
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

    // Category matching function
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

    const matchesCategory = (category: string, genre: string) => {
      if (!category || category === "all") return true;
      if (!genre) return false;
      const genreLower = genre.toLowerCase();
      const keywords = CATEGORY_KEYWORDS[category] || [category];
      return keywords.some((kw) => genreLower.includes(kw.toLowerCase()));
    };

    // Helper function to format year as date
    const formatYearAsDate = (year: string | undefined): string | null => {
      if (!year || year === "N/A" || year.trim() === "") return null;
      const yearNum = parseInt(year.trim());
      if (!isNaN(yearNum) && yearNum > 1900 && yearNum <= new Date().getFullYear() + 10) {
        return `${yearNum}-01-01`;
      }
      return null;
    };

    // Transform detailed results and apply filters
    const allResults = detailedResults
      .map((result, index) => {
        if (result.status === "rejected" || !result.value) return null;
        const detail = result.value;
        const originalItem = allSearchResults[index];
        
        // Apply language filter
        if (!matchesLanguage(language, detail.Language || "")) {
          return null;
        }

        // Apply category filter
        if (!matchesCategory(category, detail.Genre || "")) {
          return null;
        }

        const yearDate = formatYearAsDate(detail.Year || detail.Released);
        const mediaType = detail.Type === "series" ? "tv" : "movie";
        
        return {
          id: convertImdbId(detail.imdbID),
          imdb_id: detail.imdbID || null,
          name: detail.Title || "",
          title: detail.Title || "",
          overview: detail.Plot || "",
          poster_path: normalizePosterUrl(detail.Poster),
          backdrop_path: null,
          vote_average: parseFloat(detail.imdbRating) || 0,
          vote_count: parseInt((detail.imdbVotes || "0").replace(/,/g, "")) || 0,
          first_air_date: yearDate,
          release_date: yearDate,
          year: detail.Year || "",
          media_type: mediaType as const,
          language: detail.Language || "",
          genre: detail.Genre || "",
          genres: detail.Genre ? detail.Genre.split(",").map((g: string) => g.trim()) : [],
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null && item.id > 0 && !!item.name);

    // Calculate pagination
    const totalResults = allResults.length;
    const totalPages = Math.ceil(totalResults / itemsPerPage);

    console.log(`Search for "${query}": Found ${tvResults.length} TV results, ${movieResults.length} movie results, ${totalResults} total after filtering`);

    return new Response(
      JSON.stringify({
        page,
        results: allResults,
        total_pages: totalPages,
        total_results: totalResults,
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

async function searchMedia(
  type: "series" | "movie",
  query: string,
  page: number
) {
  try {
    // Trim and validate query
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 1) {
      console.log(`Empty search query for ${type}`);
      return [];
    }

    const url = `${OMDB_BASE_URL}?s=${encodeURIComponent(trimmedQuery)}&apikey=${OMDB_API_KEY}&type=${type}&page=${page}`;
    
    console.log(`Searching OMDB: ${type} for "${trimmedQuery}" (page ${page})`);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`OMDB API error: ${response.status} - ${response.statusText}`);
      const errorText = await response.text();
      console.error(`OMDB API error details:`, errorText);
      return [];
    }

    const data = await response.json();

    if (data.Response === "False") {
      // Log the error message from OMDB for debugging
      if (data.Error) {
        console.log(`OMDB search error for "${trimmedQuery}" (${type}):`, data.Error);
      } else {
        console.log(`OMDB returned False for "${trimmedQuery}" (${type})`);
      }
      return [];
    }

    if (!data.Search || !Array.isArray(data.Search)) {
      console.log(`No search results array for "${trimmedQuery}" (${type})`);
      return [];
    }

    console.log(`Found ${data.Search.length} results for "${trimmedQuery}" (${type})`);
    return data.Search || [];
  } catch (error) {
    console.error(`Error searching OMDB for "${query}" (${type}):`, error);
    return [];
  }
}
