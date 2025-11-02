import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import Dashboard from "@/pages/Dashboard";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import ItemCard from "@/components/ItemCard";
import ItemDetailsDialog from "@/components/ItemDetailsDialog";

export default function Home() {
  const [loc, setRoute] = useLocation();
  const [selected, setSelected] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const { data: items = [], isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/items"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  const searchQuery = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("q")?.trim() || "";
    } catch {
      return "";
    }
  }, [loc]);
  const filters = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return {
        status: (params.get("status") || "").trim(),
        category: (params.get("category") || "").trim(),
        location: (params.get("location") || "").trim(),
        from: (params.get("from") || "").trim(),
        to: (params.get("to") || "").trim(),
        radiusKm: (params.get("radiusKm") || "").trim(),
      };
    } catch {
      return { status: "", category: "", location: "", from: "", to: "", radiusKm: "" };
    }
  }, [loc]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const st = filters.status.toLowerCase();
    const cat = filters.category.toLowerCase();
    const locStr = filters.location.toLowerCase();
    const from = filters.from ? new Date(filters.from) : null;
    const to = filters.to ? new Date(filters.to) : null;

    return (items || []).filter((it: any) => {
      const title = String(it.title || "").toLowerCase();
      const desc = String(it.description || "").toLowerCase();
      const itemLoc = String(it.location || "").toLowerCase();
      const itemCat = String(it.category || "").toLowerCase();
      const itemSt = String(it.status || "").toLowerCase();
      const date = it.date ? new Date(it.date) : null;

      if (q && !(title.includes(q) || desc.includes(q) || itemLoc.includes(q) || itemCat.includes(q))) return false;
      if (st && itemSt !== st) return false;
      if (cat && itemCat !== cat) return false;
      if (locStr && !itemLoc.includes(locStr)) return false;
      if (from && date && date < from) return false;
      if (to && date && date > to) return false;
      return true;
    });
  }, [items, searchQuery, filters]);
  return (
    <div>
      <Hero />

      <section className="py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center">
              Search Recent Posts
            </h2>
            <SearchBar />
          </div>
        </div>
      </section>

      <section id="recent" className="py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Recent Lost & Found Items</h2>
              <p className="text-muted-foreground">Help reunite these items with their owners</p>
            </div>
            <Button variant="outline" data-testid="button-view-all" onClick={() => setRoute("/browse") }>
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          {(filters.status || filters.category || filters.location || filters.from || filters.to || filters.radiusKm || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {searchQuery && <Badge variant="secondary">Query: {searchQuery}</Badge>}
              {filters.status && <Badge variant="secondary">Status: {filters.status}</Badge>}
              {filters.category && <Badge variant="secondary">Category: {filters.category}</Badge>}
              {filters.location && <Badge variant="secondary">Location: {filters.location}</Badge>}
              {filters.from && <Badge variant="secondary">From: {filters.from}</Badge>}
              {filters.to && <Badge variant="secondary">To: {filters.to}</Badge>}
              {filters.radiusKm && <Badge variant="secondary">Radius: {filters.radiusKm} km</Badge>}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRoute("/#recent")}
              >
                Clear Filters
              </Button>
            </div>
          )}
          
          {isLoading || error ? (
            <div className="text-muted-foreground">
              {isLoading ? "Loading..." : "Failed to load items"}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {filtered.slice(0, 6).map((it: any) => (
                  <ItemCard
                    key={it.id}
                    id={it.id}
                    title={it.title}
                    description={it.description}
                    category={it.category}
                    location={it.location}
                    date={new Date(it.date).toDateString()}
                    imageUrl={it.imageUrl || undefined}
                    status={it.status}
                    onClick={() => { setSelected(it); setOpen(true); }}
                  />
                ))}
              </div>
              {filtered.length === 0 && (
                <div className="text-muted-foreground">
                  {searchQuery || filters.status || filters.category || filters.location || filters.from || filters.to || filters.radiusKm
                    ? `No items found for ${[
                        searchQuery && `"${searchQuery}"`,
                        filters.status && `status: ${filters.status}`,
                        filters.category && `category: ${filters.category}`,
                        filters.location && `location: ${filters.location}`,
                        filters.from && `from: ${filters.from}`,
                        filters.to && `to: ${filters.to}`,
                        filters.radiusKm && `radius: ${filters.radiusKm}km`,
                      ]
                        .filter(Boolean)
                        .join(", ")}`
                    : "No recent items yet."}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Embedded Dashboard Section */}
      <div className="py-0">
        <Dashboard compact />
      </div>

      <section className="pt-6 pb-16 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Matching</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              How Our Smart Matching Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI analyzes photos and descriptions to automatically find potential matches between lost and found items
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Upload & Describe</h3>
              <p className="text-sm text-muted-foreground">
                Post your lost or found item with photos and detailed description
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our system automatically scans and matches similar items
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Get Notified</h3>
              <p className="text-sm text-muted-foreground">
                Receive instant alerts when potential matches are found
              </p>
            </div>
          </div>
        </div>
      </section>

      <ItemDetailsDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSelected(null); }} item={selected || undefined} />
    </div>
  );
}
