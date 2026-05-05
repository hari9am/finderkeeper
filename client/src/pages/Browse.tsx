import { useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import ItemCard from "@/components/ItemCard";
import ItemDetailsDialog from "@/components/ItemDetailsDialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function Browse() {
  const { data: items, isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/items"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const [loc, setRoute] = useLocation();
  const [selected, setSelected] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState<string>("");

  // Track querystring changes (pushState/replaceState and back/forward)
  useEffect(() => {
    const update = () => setSearch(window.location.search || "");
    update();
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    (history as any).pushState = function (...args: any[]) {
      const ret = origPush.apply(history as any, args as any);
      window.dispatchEvent(new Event("locationchange"));
      return ret;
    } as any;
    (history as any).replaceState = function (...args: any[]) {
      const ret = origReplace.apply(history as any, args as any);
      window.dispatchEvent(new Event("locationchange"));
      return ret;
    } as any;
    window.addEventListener("popstate", update);
    window.addEventListener("locationchange", update);
    return () => {
      window.removeEventListener("popstate", update);
      window.removeEventListener("locationchange", update);
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, []);

  // Parse query params from actual URL search to ensure consistency with FilterPanel
  const { q, statusList, categoryList, locationText, from, to, radiusKm, highlight } = useMemo(() => {
    const params = new URLSearchParams(search);
    const q = (params.get("q") || "").trim().toLowerCase();
    const status = (params.get("status") || "").trim().toLowerCase();
    const category = (params.get("category") || "").trim().toLowerCase();
    const statusList = status ? status.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const categoryList = category ? category.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const locationText = (params.get("location") || "").trim().toLowerCase();
    const from = params.get("from");
    const to = params.get("to");
    const radiusKm = params.get("radiusKm");
    const highlight = params.get("highlight");
    return { q, statusList, categoryList, locationText, from, to, radiusKm, highlight };
  }, [search]);

  // Auto-open item details when highlight parameter is present
  useEffect(() => {
    if (highlight && items && !open) {
      const highlightedItem = items.find(item => item.id === highlight);
      if (highlightedItem) {
        setSelected(highlightedItem);
        setOpen(true);
      }
    }
  }, [highlight, items, open]);

  const filtered = useMemo(() => (items ?? []).filter((it) => {
    const title = String(it.title || "").toLowerCase();
    const desc = String(it.description || "").toLowerCase();
    const locStr = String(it.location || "").toLowerCase();
    const cat = String(it.category || "").toLowerCase();
    const st = String(it.status || "").toLowerCase();
    const date = it.date ? new Date(it.date) : null;

    if (q && !(title.includes(q) || desc.includes(q) || locStr.includes(q) || cat.includes(q))) return false;
    if (statusList.length && !statusList.includes(st)) return false;
    if (categoryList.length && !categoryList.includes(cat)) return false;
    if (locationText && !locStr.includes(locationText)) return false;
    if (from && date && date < new Date(from)) return false;
    if (to && date && date > new Date(to)) return false;
    // radiusKm omitted: no geo coords available yet
    return true;
  }), [items, q, statusList, categoryList, locationText, from, to, radiusKm]);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Browse Items</h1>
          <p className="text-muted-foreground mb-6">
            Search through thousands of lost and found items
          </p>
          <div className="flex gap-4">
            <div className="flex-1">
              <SearchBar />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className={`hidden md:block w-full md:w-64 flex-shrink-0`}>
            <FilterPanel />
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground" data-testid="text-results-count">
                {isLoading ? "Loading..." : error ? "Failed to load" : `Showing ${filtered.length} results`}
              </p>
            </div>

            {(q || statusList.length || categoryList.length || locationText || from || to || radiusKm) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {q && <Badge variant="secondary">Query: {q}</Badge>}
                {statusList.map((s) => (
                  <Badge key={`s-${s}`} variant="secondary">Status: {s}</Badge>
                ))}
                {categoryList.map((c) => (
                  <Badge key={`c-${c}`} variant="secondary">Category: {c}</Badge>
                ))}
                {locationText && <Badge variant="secondary">Location: {locationText}</Badge>}
                {from && <Badge variant="secondary">From: {from}</Badge>}
                {to && <Badge variant="secondary">To: {to}</Badge>}
                {radiusKm && <Badge variant="secondary">Radius: {radiusKm} km</Badge>}
                <Button size="sm" variant="ghost" onClick={() => setRoute("/browse")}>Clear</Button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {!isLoading && filtered.map((it) => (
                <div 
                  key={it.id} 
                  className={`${highlight === it.id ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}`}
                >
                  <ItemCard
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ItemDetailsDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSelected(null); }} item={selected || undefined} />
    </div>
  );
}
