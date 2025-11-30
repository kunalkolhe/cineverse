import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { fetchTmdbSeriesDetails } from "@/integrations/supabase/tmdb";
import { Link } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("user_watch_history")
      .select(
        `
        *,
        episodes (
          id,
          episode_number,
          name,
          series_id,
          season_id,
          seasons (season_number)
        )
      `
      )
      .eq("user_id", user.id)
      .order("watched_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setHistory(data);
    }
  };

  // Group by series
  const seriesMap = new Map<number, any[]>();
  history.forEach((item) => {
    const seriesId = item.episodes?.series_id;
    if (seriesId) {
      if (!seriesMap.has(seriesId)) {
        seriesMap.set(seriesId, []);
      }
      seriesMap.get(seriesId)!.push(item);
    }
  });

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Watch History</h1>
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-lg">
                You haven't watched any episodes yet. Start watching to see your history here!
              </p>
              <Link to="/" className="mt-4 inline-block">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                  Browse Series
                </button>
              </Link>
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
        <h1 className="text-3xl font-bold">Watch History</h1>
        <div className="space-y-6">
          {Array.from(seriesMap.entries()).map(([seriesId, episodes]) => (
            <Card key={seriesId}>
              <CardContent className="p-6">
                <Link to={`/series/${seriesId}`}>
                  <h2 className="text-xl font-semibold mb-4 hover:underline">
                    Series ID: {seriesId}
                  </h2>
                </Link>
                <div className="space-y-2">
                  {episodes.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded border border-border"
                    >
                      <div>
                        <p className="font-medium">
                          Season {item.episodes?.seasons?.season_number || "?"}, Episode{" "}
                          {item.episodes?.episode_number || "?"}
                        </p>
                        {item.episodes?.name && (
                          <p className="text-sm text-muted-foreground">{item.episodes.name}</p>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(item.watched_at), "MMM d, yyyy")}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;

