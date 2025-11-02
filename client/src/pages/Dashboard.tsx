import StatsCard from "@/components/StatsCard";
import { Package, CheckCircle, TrendingUp, Award, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, queryClient, apiRequest } from "@/lib/queryClient";
import ItemCard from "@/components/ItemCard";
import { Link } from "wouter";

type DashboardProps = { compact?: boolean };

export default function Dashboard({ compact = false }: DashboardProps) {
  const { data: myItems, isLoading, error } = useQuery<any[] | null>({
    queryKey: ["/api/user/items"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/items/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/user/items"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/items"] });
    },
  });

  return (
    <div className={compact ? "py-6" : "min-h-screen py-8"}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your posts and activity</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Posts" value="0" icon={Package} />
          <StatsCard title="Active Items" value="0" icon={TrendingUp} />
          <StatsCard title="Successful Matches" value="0" icon={CheckCircle} />
          <StatsCard title="Karma Points" value="0" icon={Award} />
        </div>

        <Tabs defaultValue="my-posts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-posts" data-testid="tab-my-posts">My Posts</TabsTrigger>
            <TabsTrigger value="matches" data-testid="tab-matches">Potential Matches</TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="my-posts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Posted Items</h2>
            </div>
            {isLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : myItems === null ? (
              <div className="flex items-center justify-between p-4 rounded-md border bg-muted/30">
                <div>
                  <div className="font-medium">Sign in to view and manage your posts</div>
                  <div className="text-sm text-muted-foreground">Use Google or the default login.</div>
                </div>
                <div className="flex gap-2">
                  <Button asChild>
                    <a href="/api/login/google">Sign in with Google</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/api/login">Sign in</a>
                  </Button>
                </div>
              </div>
            ) : error ? (
              <div className="text-red-600">Failed to load your items</div>
            ) : (myItems?.length ?? 0) === 0 ? (
              <div className="text-muted-foreground">You haven't posted any items yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myItems!.map((it) => (
                  <div key={it.id} className="relative group">
                    <ItemCard
                      id={it.id}
                      title={it.title}
                      description={it.description}
                      category={it.category}
                      location={it.location}
                      date={new Date(it.date).toDateString()}
                      imageUrl={it.imageUrl || undefined}
                      status={it.status}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Link href={`/post/${it.id}`}>
                        <Button size="sm" variant="secondary" asChild={false} data-testid={`button-edit-${it.id}`}>
                          <span className="flex items-center">
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </span>
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(it.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${it.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="matches">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Matches Yet</h3>
              <p className="text-muted-foreground">
                Our AI will notify you when potential matches are found
              </p>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Messages</h3>
              <p className="text-muted-foreground">
                Your conversations will appear here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
