import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  return (
    <div className="relative w-full max-w-2xl">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search lost items by description, location, or category..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-12 h-14 rounded-full text-base"
        data-testid="input-search"
      />
    </div>
  );
}
