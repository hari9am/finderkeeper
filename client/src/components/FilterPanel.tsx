import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

const categories = [
  "Electronics",
  "Wallets & Purses",
  "Keys",
  "Pets",
  "Documents",
  "Jewelry",
  "Clothing",
  "Other",
];

export default function FilterPanel() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedStatus([]);
  };

  const hasFilters = selectedCategories.length > 0 || selectedStatus.length > 0;

  return (
    <div className="space-y-4">
      {hasFilters && (
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((cat) => (
              <Badge key={cat} variant="secondary" className="gap-1" data-testid={`badge-filter-${cat.toLowerCase()}`}>
                {cat}
                <button onClick={() => toggleCategory(cat)} data-testid={`button-remove-${cat.toLowerCase()}`}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {selectedStatus.map((status) => (
              <Badge key={status} variant="secondary" className="gap-1" data-testid={`badge-filter-${status.toLowerCase()}`}>
                {status}
                <button onClick={() => toggleStatus(status)} data-testid={`button-remove-${status.toLowerCase()}`}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={clearAll} data-testid="button-clear-filters">
            Clear all
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="lost"
              checked={selectedStatus.includes("Lost")}
              onCheckedChange={() => toggleStatus("Lost")}
              data-testid="checkbox-lost"
            />
            <Label htmlFor="lost" className="cursor-pointer">
              Lost Items
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="found"
              checked={selectedStatus.includes("Found")}
              onCheckedChange={() => toggleStatus("Found")}
              data-testid="checkbox-found"
            />
            <Label htmlFor="found" className="cursor-pointer">
              Found Items
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
                data-testid={`checkbox-${category.toLowerCase()}`}
              />
              <Label htmlFor={category} className="cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
