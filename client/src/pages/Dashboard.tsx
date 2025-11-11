import StatsCard from "@/components/StatsCard";
import { Package, CheckCircle, TrendingUp, Trash2, Pencil, Bell, Eye, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type DashboardProps = { compact?: boolean };

export default function Dashboard({ compact = false }: DashboardProps) {
  const { data: myItems, isLoading, error } = useQuery<any[] | null>({
    queryKey: ["/api/user/items"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Fetch matches for each item
  const { data: itemMatches } = useQuery<Record<string, any[]>>({
    queryKey: ["/api/user/item-matches"],
    queryFn: async () => {
      if (!myItems || myItems.length === 0) return {};
      const matches: Record<string, any[]> = {};
      
      for (const item of myItems) {
        try {
          const response = await fetch(`/api/items/${item.id}/matches`);
          if (response.ok) {
            const data = await response.json();
            matches[item.id] = data.matches || [];
          } else {
            matches[item.id] = [];
          }
        } catch (error) {
          console.error(`Error fetching matches for item ${item.id}:`, error);
          matches[item.id] = [];
        }
      }
      return matches;
    },
    enabled: !!myItems && myItems.length > 0,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/items/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/user/items"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/user/notifications"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/user/item-matches"] });
    },
  });

  const totalPosts = Array.isArray(myItems) ? myItems.length : 0;
  const activeItems = Array.isArray(myItems) ? myItems.filter(() => true).length : 0;
  const successfulMatches = 0;

  return (
    <div className={compact ? "py-6" : "min-h-screen py-8"}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your posts and activity</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatsCard title="Total Posts" value={`${totalPosts}`} icon={Package} />
          <StatsCard title="Active Items" value={`${activeItems}`} icon={TrendingUp} />
          <StatsCard title="Successful Matches" value={`${successfulMatches}`} icon={CheckCircle} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                My Posts & AI Matches
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/user/items"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/user/item-matches"] });
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Matches
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>

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
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <div className="text-muted-foreground">You haven't posted any items yet.</div>
                <Link href="/report">
                  <Button className="mt-4">
                    Post Your First Item
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">My Post</TableHead>
                      <TableHead>AI Matches</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myItems!.map((item) => {
                      const matches = itemMatches?.[item.id] || [];
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-start gap-3">
                              {item.imageUrl && (
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.title}
                                  className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate">{item.title}</div>
                                <div className="text-sm text-muted-foreground line-clamp-2">
                                  {item.description}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={item.status === 'lost' ? 'destructive' : 'default'}>
                                    {item.status}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {item.category}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  📍 {item.location}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {matches.length === 0 ? (
                              <div className="text-sm text-muted-foreground py-4">
                                <Search className="w-4 h-4 mx-auto mb-2" />
                                <div className="text-center">No matches found</div>
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {matches.slice(0, 3).map((match: any) => (
                                  <div key={match.id} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                                    {match.imageUrl && (
                                      <img 
                                        src={match.imageUrl} 
                                        alt={match.title}
                                        className="w-8 h-8 object-cover rounded flex-shrink-0"
                                      />
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div className="text-sm font-medium truncate">{match.title}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {Math.round((match._match?.score || 0) * 100)}% match
                                      </div>
                                    </div>
                                    <Link href={`/browse?highlight=${match.id}`}>
                                      <Button size="sm" variant="ghost">
                                        <Eye className="w-3 h-3" />
                                      </Button>
                                    </Link>
                                  </div>
                                ))}
                                {matches.length > 3 && (
                                  <div className="text-xs text-muted-foreground text-center">
                                    +{matches.length - 3} more matches
                                  </div>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Link href={item.status === 'found' ? `/report/${item.id}` : `/post/${item.id}`}>
                                <Button size="sm" variant="outline" className="w-full">
                                  <Pencil className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteMutation.mutate(item.id)}
                                disabled={deleteMutation.isPending}
                                className="w-full"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
