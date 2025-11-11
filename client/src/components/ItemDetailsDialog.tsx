import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Eye, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

interface ItemDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: any;
}

export default function ItemDetailsDialog({ open, onOpenChange, item }: ItemDetailsDialogProps) {
  const { user } = useAuth();
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [matchError, setMatchError] = useState<string | undefined>();

  // Auto-load matches when dialog opens
  useEffect(() => {
    const loadMatches = async () => {
      if (!item?.id || !open) return;
      
      setLoadingMatches(true);
      setMatchError(undefined);
      try {
        const resp = await fetch(`/api/items/${item.id}/matches`);
        if (!resp.ok) throw new Error("Failed to load matches");
        const data = await resp.json();
        setMatches(data?.matches || []);
      } catch (e: any) {
        setMatchError(e?.message || "Failed to load matches");
      } finally {
        setLoadingMatches(false);
      }
    };

    if (open && item) {
      loadMatches();
    } else {
      // Reset state when dialog closes
      setMatches([]);
      setMatchError(undefined);
      setLoadingMatches(false);
    }
  }, [open, item?.id]);

  if (!item) return null;

  const isOwner = user?.id && item.userId && user.id === item.userId;
  const mapsUrl = item.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}` : undefined;
  const mapsEmbed = item.location ? `https://www.google.com/maps?q=${encodeURIComponent(item.location)}&output=embed` : undefined;
  const canCall = !!item.contactPhone && !isOwner;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
          <DialogDescription>
            {item.status === "lost" ? "Lost Item" : "Found Item"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-md overflow-hidden">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-48 bg-muted" />
            )}
          </div>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">{item.description}</div>
            <div className="text-sm">
              <div className="font-medium">Category</div>
              <div>{item.category}</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Location</div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{item.location}</span>
              </div>
              {mapsEmbed && (
                <div className="mt-2 rounded-md overflow-hidden border">
                  <iframe
                    title="map"
                    src={mapsEmbed}
                    className="w-full h-40"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
            <div className="text-sm">
              <div className="font-medium">Contact</div>
              <div className="flex flex-col gap-1">
                {item.contactName && <span>{item.contactName}</span>}
                {item.contactEmail && <span>{item.contactEmail}</span>}
                {item.contactPhone && <span>{isOwner ? "Your phone (hidden for you)" : item.contactPhone}</span>}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              {canCall && (
                <a href={`tel:${item.contactPhone}`}>
                  <Button>
                    <Phone className="w-4 h-4 mr-2" /> Call
                  </Button>
                </a>
              )}
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline">
                    <MapPin className="w-4 h-4 mr-2" /> View Location
                  </Button>
                </a>
              )}
            </div>
            {/* AI Matches Section */}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4" />
                <span className="font-medium text-sm">AI Matches</span>
                {loadingMatches && (
                  <Badge variant="secondary" className="text-xs">Loading...</Badge>
                )}
              </div>
              
              {matchError && (
                <div className="text-sm text-red-500 p-2 bg-red-50 rounded-md">{matchError}</div>
              )}
              
              {!matchError && matches.length === 0 && !loadingMatches && (
                <div className="text-sm text-muted-foreground p-3 text-center bg-muted/30 rounded-md">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <div>No matches found</div>
                </div>
              )}
              
              {matches.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {matches.map((match) => (
                    <div key={match.id} className="flex items-center gap-3 p-3 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                      {match.imageUrl ? (
                        <img 
                          src={match.imageUrl} 
                          alt={match.title} 
                          className="w-12 h-12 object-cover rounded flex-shrink-0" 
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-sm">{match.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          📍 {match.location}
                        </div>
                        {match._match && (
                          <div className="text-xs text-primary font-medium">
                            {Math.round((match._match.score || 0) * 100)}% match
                          </div>
                        )}
                      </div>
                      <Link href={`/browse?highlight=${match.id}`}>
                        <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
                          <Eye className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                  {matches.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center pt-2">
                      Showing top {Math.min(matches.length, 5)} matches
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
