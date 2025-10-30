import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import FilterPanel from "@/components/FilterPanel";
import ItemCard from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import walletImage from "@assets/generated_images/Lost_wallet_item_photo_ebc7ad65.png";
import dogImage from "@assets/generated_images/Found_dog_item_photo_4aed6d43.png";
import keysImage from "@assets/generated_images/Lost_keys_item_photo_bc6d5d42.png";

export default function Browse() {
  const [filterOpen, setFilterOpen] = useState(false);

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
            <Button
              variant="outline"
              className="md:hidden"
              onClick={() => setFilterOpen(!filterOpen)}
              data-testid="button-toggle-filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className={`${filterOpen ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <FilterPanel />
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground" data-testid="text-results-count">
                Showing 3 results
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ItemCard
                id="1"
                title="Black Leather Wallet"
                description="Lost black leather wallet with cards and ID inside. Last seen near Central Park."
                category="Wallets & Purses"
                location="Central Park, NY"
                date="Oct 28, 2025"
                imageUrl={walletImage}
                status="lost"
              />
              <ItemCard
                id="2"
                title="Golden Retriever"
                description="Found friendly golden retriever in downtown area. Wearing blue collar, no tags."
                category="Pets"
                location="Downtown, NY"
                date="Oct 29, 2025"
                imageUrl={dogImage}
                status="found"
                aiMatch={true}
              />
              <ItemCard
                id="3"
                title="Set of Keys"
                description="Found keys with blue keychain near the subway station. Multiple keys on ring."
                category="Keys"
                location="Metro Station, NY"
                date="Oct 30, 2025"
                imageUrl={keysImage}
                status="found"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
