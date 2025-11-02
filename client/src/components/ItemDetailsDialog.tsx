import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ItemDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: any;
}

export default function ItemDetailsDialog({ open, onOpenChange, item }: ItemDetailsDialogProps) {
  const { user } = useAuth();

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
