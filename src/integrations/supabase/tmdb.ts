const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || "";

if (!TMDB_API_KEY) {
  console.warn("VITE_TMDB_API_KEY is not configured. TMDB features will not work.");
}

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export type TmdbListType = "trending" | "popular" | "top_rated" | "upcoming" | "now_playing";

export interface TmdbSeriesSummary {
  id: number;
  name?: string;
  title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date?: string;
  release_date?: string;
  media_type?: "tv" | "movie";
  original_language?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
}

export interface TmdbDiscoverResponse {
  page: number;
  results: TmdbSeriesSummary[];
  total_pages: number;
  total_results: number;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TmdbSeriesDetails {
  id: number;
  name?: string;
  title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date?: string;
  release_date?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  runtime?: number;
  episode_run_time?: number[];
  genres: { id: number; name: string }[];
  seasons?: any[];
  credits?: {
    cast: TmdbCastMember[];
    crew: any[];
  };
  videos?: {
    results: any[];
  };
  images?: {
    backdrops: any[];
    posters: any[];
  };
  status?: string;
  tagline?: string;
  budget?: number;
  revenue?: number;
}

const GENRE_MAP: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

const CATEGORY_TO_GENRE_IDS: Record<string, number[]> = {
  action: [28, 10759],
  adventure: [12, 10759],
  animation: [16],
  comedy: [35],
  crime: [80],
  documentary: [99],
  drama: [18],
  family: [10751],
  fantasy: [14, 10765],
  history: [36],
  horror: [27],
  mystery: [9648],
  romance: [10749],
  "sci-fi": [878, 10765],
  thriller: [53],
  war: [10752, 10768],
  western: [37],
};

export function getImageUrl(path: string | null, size: "w200" | "w300" | "w500" | "w780" | "original" = "w500"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  if (!TMDB_API_KEY) {
    console.error("TMDB API Key is missing! Check VITE_TMDB_API_KEY environment variable.");
    throw new Error("TMDB API Key is not configured");
  }
  
  const searchParams = new URLSearchParams();
  searchParams.set("api_key", TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });
  
  const url = `${TMDB_BASE_URL}${endpoint}?${searchParams.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TMDB API error: ${response.status}`, errorText);
      throw new Error(`TMDB API error: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Network error fetching TMDB:", error);
    throw error;
  }
}

export async function fetchTmdbSeriesList(
  type: TmdbListType,
  options?: { page?: number; language?: string; mediaType?: "tv" | "movie" | "all"; category?: string; year?: string; genres?: number[] }
): Promise<TmdbDiscoverResponse> {
  const { page = 1, language = "all", mediaType = "all", category = "all", year, genres } = options ?? {};

  try {
    let results: TmdbSeriesSummary[] = [];
    let totalResults = 0;
    let totalPages = 0;

    const languageParam = language !== "all" ? language : undefined;
    const categoryGenreIds = category !== "all" ? CATEGORY_TO_GENRE_IDS[category.toLowerCase()] : undefined;
    const genreIds = genres && genres.length > 0 ? genres : categoryGenreIds;

    const fetchForMediaType = async (mType: "tv" | "movie"): Promise<TmdbDiscoverResponse> => {
      const params: Record<string, string> = { page: page.toString() };
      
      const hasFilters = languageParam || (genreIds && genreIds.length > 0);
      
      if (languageParam) {
        params.with_original_language = languageParam;
      }

      if (genreIds && genreIds.length > 0) {
        params.with_genres = genreIds.join("|");
      }

      if (year) {
        if (mType === "movie") {
          params.primary_release_year = year;
        } else {
          params.first_air_date_year = year;
        }
      }

      let endpoint = "";
      
      if (hasFilters) {
        endpoint = `/discover/${mType}`;
        
        if (type === "popular") {
          params.sort_by = "popularity.desc";
        } else if (type === "top_rated") {
          params.sort_by = "vote_average.desc";
          params.vote_count_gte = "200";
        } else if (type === "trending") {
          params.sort_by = "popularity.desc";
        } else if (type === "upcoming") {
          params.sort_by = "popularity.desc";
          const today = new Date().toISOString().split("T")[0];
          if (mType === "movie") {
            params["primary_release_date.gte"] = today;
          } else {
            params["first_air_date.gte"] = today;
          }
        } else if (type === "now_playing") {
          params.sort_by = "popularity.desc";
          const today = new Date().toISOString().split("T")[0];
          const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
          if (mType === "movie") {
            params["primary_release_date.gte"] = oneMonthAgo;
            params["primary_release_date.lte"] = today;
          } else {
            params["first_air_date.gte"] = oneMonthAgo;
            params["first_air_date.lte"] = today;
          }
        }
      } else {
        if (type === "trending") {
          endpoint = `/trending/${mType}/week`;
        } else if (type === "popular") {
          endpoint = `/${mType}/popular`;
        } else if (type === "top_rated") {
          endpoint = `/${mType}/top_rated`;
        } else if (type === "upcoming") {
          if (mType === "movie") {
            endpoint = "/movie/upcoming";
          } else {
            endpoint = "/tv/on_the_air";
          }
        } else if (type === "now_playing") {
          if (mType === "movie") {
            endpoint = "/movie/now_playing";
          } else {
            endpoint = "/tv/airing_today";
          }
        }
      }

      const data = await tmdbFetch<TmdbDiscoverResponse>(endpoint, params);
      return {
        ...data,
        results: data.results.map((item) => ({
          ...item,
          media_type: mType,
          poster_path: getImageUrl(item.poster_path),
          backdrop_path: getImageUrl(item.backdrop_path, "w780"),
        })),
      };
    };

    if (mediaType === "all") {
      const [tvData, movieData] = await Promise.all([
        fetchForMediaType("tv"),
        fetchForMediaType("movie"),
      ]);

      const combined = [...tvData.results, ...movieData.results];
      combined.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

      results = combined;
      totalResults = tvData.total_results + movieData.total_results;
      totalPages = Math.max(tvData.total_pages, movieData.total_pages);
    } else {
      const data = await fetchForMediaType(mediaType);
      results = data.results;
      totalResults = data.total_results;
      totalPages = data.total_pages;
    }

    return {
      page,
      results,
      total_pages: totalPages,
      total_results: totalResults,
    };
  } catch (err) {
    console.error(`Failed to fetch TMDB data for ${type}:`, err);
    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }
}

export async function fetchTmdbSeriesDetails(
  seriesId: number | string,
  options?: { language?: string; sync?: boolean }
): Promise<TmdbSeriesDetails | null> {
  try {
    const data = await tmdbFetch<TmdbSeriesDetails>(`/tv/${seriesId}`, {
      append_to_response: "credits,videos,images",
    });

    return {
      ...data,
      poster_path: getImageUrl(data.poster_path),
      backdrop_path: getImageUrl(data.backdrop_path, "w780"),
      credits: data.credits
        ? {
            cast: data.credits.cast.map((c) => ({
              ...c,
              profile_path: getImageUrl(c.profile_path, "w200"),
            })),
            crew: data.credits.crew,
          }
        : undefined,
      seasons: data.seasons?.map((s) => ({
        ...s,
        poster_path: getImageUrl(s.poster_path, "w300"),
      })),
    };
  } catch (err) {
    console.error(`Failed to fetch TMDB series details for ${seriesId}:`, err);
    return null;
  }
}

export async function fetchTmdbMovieDetails(
  movieId: number | string,
  options?: { language?: string }
): Promise<TmdbSeriesDetails | null> {
  try {
    const data = await tmdbFetch<TmdbSeriesDetails>(`/movie/${movieId}`, {
      append_to_response: "credits,videos,images",
    });

    return {
      ...data,
      poster_path: getImageUrl(data.poster_path),
      backdrop_path: getImageUrl(data.backdrop_path, "w780"),
      credits: data.credits
        ? {
            cast: data.credits.cast.map((c) => ({
              ...c,
              profile_path: getImageUrl(c.profile_path, "w200"),
            })),
            crew: data.credits.crew,
          }
        : undefined,
    };
  } catch (err) {
    console.error(`Failed to fetch TMDB movie details for ${movieId}:`, err);
    return null;
  }
}

export async function fetchSeasonEpisodes(
  seriesId: number | string,
  seasonNumber: number
): Promise<any | null> {
  try {
    const data = await tmdbFetch<any>(`/tv/${seriesId}/season/${seasonNumber}`);
    return {
      ...data,
      episodes: data.episodes?.map((ep: any) => ({
        ...ep,
        still_path: getImageUrl(ep.still_path, "w300"),
      })),
    };
  } catch (err) {
    console.error(`Failed to fetch TMDB season episodes:`, err);
    return null;
  }
}

export async function searchTmdbSeries(
  query: string,
  options?: { page?: number; language?: string; category?: string }
): Promise<TmdbDiscoverResponse> {
  const { page = 1, language = "all", category = "all" } = options ?? {};

  try {
    if (!query || query.trim().length === 0) {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }

    const params: Record<string, string> = {
      query: query.trim(),
      page: page.toString(),
      include_adult: "false",
    };

    if (language !== "all") {
      params.language = language;
    }

    const [tvData, movieData] = await Promise.all([
      tmdbFetch<TmdbDiscoverResponse>("/search/tv", params),
      tmdbFetch<TmdbDiscoverResponse>("/search/movie", params),
    ]);

    let results = [
      ...tvData.results.map((item) => ({
        ...item,
        media_type: "tv" as const,
        poster_path: getImageUrl(item.poster_path),
        backdrop_path: getImageUrl(item.backdrop_path, "w780"),
      })),
      ...movieData.results.map((item) => ({
        ...item,
        media_type: "movie" as const,
        poster_path: getImageUrl(item.poster_path),
        backdrop_path: getImageUrl(item.backdrop_path, "w780"),
      })),
    ];

    if (category !== "all") {
      const genreIds = CATEGORY_TO_GENRE_IDS[category.toLowerCase()] || [];
      if (genreIds.length > 0) {
        results = results.filter((item) => 
          item.genre_ids?.some((id) => genreIds.includes(id))
        );
      }
    }

    results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

    return {
      page,
      results,
      total_pages: Math.max(tvData.total_pages, movieData.total_pages),
      total_results: tvData.total_results + movieData.total_results,
    };
  } catch (err) {
    console.error(`Failed to search TMDB for "${query}":`, err);
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
}

export async function searchTmdbSuggestions(query: string): Promise<TmdbSeriesSummary[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const [tvData, movieData] = await Promise.all([
      tmdbFetch<TmdbDiscoverResponse>("/search/tv", {
        query: query.trim(),
        page: "1",
      }),
      tmdbFetch<TmdbDiscoverResponse>("/search/movie", {
        query: query.trim(),
        page: "1",
      }),
    ]);

    const combined = [
      ...tvData.results.slice(0, 5).map((item) => ({
        ...item,
        media_type: "tv" as const,
        poster_path: getImageUrl(item.poster_path, "w200"),
      })),
      ...movieData.results.slice(0, 5).map((item) => ({
        ...item,
        media_type: "movie" as const,
        poster_path: getImageUrl(item.poster_path, "w200"),
      })),
    ];

    combined.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

    return combined.slice(0, 8);
  } catch (err) {
    console.error(`Failed to get suggestions for "${query}":`, err);
    return [];
  }
}

export async function fetchTrendingContent(
  mediaType: "tv" | "movie" | "all" = "all",
  options?: { page?: number; year?: string; language?: string }
): Promise<TmdbDiscoverResponse> {
  const { page = 1, year, language = "all" } = options ?? {};

  try {
    if (mediaType === "all") {
      const data = await tmdbFetch<TmdbDiscoverResponse>("/trending/all/week", {
        page: page.toString(),
      });

      let results = data.results.map((item) => ({
        ...item,
        poster_path: getImageUrl(item.poster_path),
        backdrop_path: getImageUrl(item.backdrop_path, "w780"),
      }));

      if (year) {
        results = results.filter((item) => {
          const itemYear = item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4);
          return itemYear === year;
        });
      }

      if (language !== "all") {
        results = results.filter((item) => item.original_language === language);
      }

      return { ...data, results };
    }

    const data = await tmdbFetch<TmdbDiscoverResponse>(`/trending/${mediaType}/week`, {
      page: page.toString(),
    });

    let results = data.results.map((item) => ({
      ...item,
      media_type: mediaType,
      poster_path: getImageUrl(item.poster_path),
      backdrop_path: getImageUrl(item.backdrop_path, "w780"),
    }));

    if (year) {
      results = results.filter((item) => {
        const itemYear = item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4);
        return itemYear === year;
      });
    }

    if (language !== "all") {
      results = results.filter((item) => item.original_language === language);
    }

    return { ...data, results };
  } catch (err) {
    console.error("Failed to fetch trending content:", err);
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
}
