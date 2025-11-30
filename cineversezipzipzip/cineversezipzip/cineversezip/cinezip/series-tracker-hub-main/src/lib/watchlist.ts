export interface WatchlistItem {
  id: number;
  media_type: "tv" | "movie";
  status: "planned" | "watched";
  name: string;
  poster_path: string | null;
  vote_average: number;
  year: string | null;
  added_at: string;
}

const WATCHLIST_STORAGE_KEY = "cineverse_watchlist_v2";

export function getWatchlist(): WatchlistItem[] {
  try {
    const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getWatchlistByStatus(status: "planned" | "watched" | "all"): WatchlistItem[] {
  const items = getWatchlist();
  if (status === "all") return items;
  return items.filter((item) => item.status === status);
}

export function getWatchlistItem(id: number, media_type: "tv" | "movie"): WatchlistItem | undefined {
  const items = getWatchlist();
  return items.find((item) => item.id === id && item.media_type === media_type);
}

export function addToWatchlist(item: Omit<WatchlistItem, "added_at">): void {
  const items = getWatchlist();
  const existingIndex = items.findIndex((i) => i.id === item.id && i.media_type === item.media_type);
  
  const newItem: WatchlistItem = {
    ...item,
    added_at: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    items[existingIndex] = newItem;
  } else {
    items.unshift(newItem);
  }

  localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
}

export function updateWatchlistStatus(id: number, media_type: "tv" | "movie", status: "planned" | "watched"): boolean {
  const items = getWatchlist();
  const index = items.findIndex((item) => item.id === id && item.media_type === media_type);
  
  if (index >= 0) {
    items[index].status = status;
    items[index].added_at = new Date().toISOString();
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
    return true;
  }
  return false;
}

export function removeFromWatchlist(id: number, media_type: "tv" | "movie"): void {
  const items = getWatchlist();
  const filtered = items.filter((item) => !(item.id === id && item.media_type === media_type));
  localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(filtered));
}

export function isInWatchlist(id: number, media_type: "tv" | "movie"): boolean {
  const items = getWatchlist();
  return items.some((item) => item.id === id && item.media_type === media_type);
}

export function getItemStatus(id: number, media_type: "tv" | "movie"): "planned" | "watched" | null {
  const item = getWatchlistItem(id, media_type);
  return item?.status || null;
}

export function getWatchlistStats() {
  const items = getWatchlist();
  return {
    total: items.length,
    planned: items.filter((i) => i.status === "planned").length,
    watched: items.filter((i) => i.status === "watched").length,
    movies: items.filter((i) => i.media_type === "movie").length,
    series: items.filter((i) => i.media_type === "tv").length,
  };
}
