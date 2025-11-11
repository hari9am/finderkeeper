import { MapPin, Calendar, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ItemCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  imageUrl: string;
  status: "lost" | "found";
  aiMatch?: boolean;
  onClick?: () => void;
}

export default function ItemCard({
  title,
  description,
  category,
  location,
  date,
  imageUrl,
  status,
  aiMatch = false,
  onClick,
}: ItemCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate cursor-pointer" onClick={onClick} data-testid={`card-item-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="relative aspect-[4/3]">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        <Badge
          className="absolute top-2 left-2 text-xs"
          variant={status === "lost" ? "destructive" : "default"}
          data-testid={`badge-status-${status}`}
        >
          {status === "lost" ? "Lost" : "Found"}
        </Badge>
        {aiMatch && (
          <Badge className="absolute top-2 right-2 bg-purple-600 text-white text-xs" data-testid="badge-ai-match">
            AI Match
          </Badge>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold text-base line-clamp-1 mb-2" data-testid="text-item-title">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2" data-testid="text-item-description">
          {description}
        </p>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3 flex-shrink-0" />
            <span data-testid="text-item-category">{category}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span data-testid="text-item-location">{location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span data-testid="text-item-date">{date}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
