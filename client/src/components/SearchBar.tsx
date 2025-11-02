import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [loc, setRoute] = useLocation();
  const firstLoadRef = useRef(true);

  const apply = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    const qs = params.toString();
    const href = qs ? `/?${qs}#recent` : `/#recent`;
    setRoute(href);
  };

  // Initialize state from URL params (persist query)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q") || "";
      setQuery(q);
    } catch {}
  }, [loc]);

  // Auto-apply search as user types (debounced)
  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    const tid = setTimeout(() => {
      apply();
    }, 400);
    return () => clearTimeout(tid);
  }, [query]);

  return (
    <div className="w-full max-w-2xl flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search lost items by description, location, or category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") apply();
          }}
          className="pl-12 h-14 rounded-full text-base"
          data-testid="input-search"
        />
      </div>
    </div>
  );
}
