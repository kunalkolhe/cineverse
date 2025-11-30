import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Check, X, Users } from "lucide-react";
import { motion } from "framer-motion";

const Friends = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [searchEmail, setSearchEmail] = useState("");

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, []);

  const loadFriends = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("friendships")
      .select(
        `
        *,
        friend:profiles!friendships_friend_id_fkey(id, username, full_name, avatar_url)
      `
      )
      .eq("user_id", user.id)
      .eq("status", "accepted");

    if (!error && data) {
      setFriends(data);
    }
  };

  const loadPendingRequests = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("friendships")
      .select(
        `
        *,
        friend:profiles!friendships_friend_id_fkey(id, username, full_name, avatar_url),
        user:profiles!friendships_user_id_fkey(id, username, full_name, avatar_url)
      `
      )
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq("status", "pending");

    if (!error && data) {
      setPendingRequests(data);
    }
  };

  const handleSendRequest = async () => {
    if (!searchEmail.trim()) {
      toast.error("Please enter an email");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login");
      return;
    }

    // Find user by email
    const { data: targetUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", searchEmail) // In real app, search by email via auth.users
      .single();

    if (!targetUser) {
      toast.error("User not found");
      return;
    }

    const { error } = await supabase.from("friendships").insert({
      user_id: user.id,
      friend_id: targetUser.id,
      status: "pending",
    });

    if (!error) {
      toast.success("Friend request sent");
      setSearchEmail("");
      loadPendingRequests();
    } else {
      toast.error("Failed to send request");
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", requestId);

    if (!error) {
      toast.success("Friend request accepted");
      loadFriends();
      loadPendingRequests();
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const { error } = await supabase.from("friendships").delete().eq("id", requestId);

    if (!error) {
      toast.success("Friend request rejected");
      loadPendingRequests();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold">Friends</h1>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Add Friend</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Search by username or email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
              <Button onClick={handleSendRequest}>
                <UserPlus className="mr-2 h-4 w-4" />
                Send Request
              </Button>
            </div>
          </CardContent>
        </Card>

        {pendingRequests.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Pending Requests</h2>
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {request.friend?.username || request.user?.username || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.status === "pending" && "Pending"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        variant="default"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRejectRequest(request.id)}
                        variant="outline"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">My Friends ({friends.length})</h2>
          {friends.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No friends yet. Start adding friends!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {friends.map((friend) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {friend.friend?.avatar_url ? (
                          <img
                            src={friend.friend.avatar_url}
                            alt={friend.friend.username}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {friend.friend?.username || friend.friend?.full_name || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {friend.friend?.full_name || ""}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;

