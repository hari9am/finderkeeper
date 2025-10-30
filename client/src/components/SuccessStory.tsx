import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

interface SuccessStoryProps {
  userName: string;
  userAvatar: string;
  itemName: string;
  story: string;
  location: string;
  karmaEarned: number;
}

export default function SuccessStory({
  userName,
  userAvatar,
  itemName,
  story,
  location,
  karmaEarned,
}: SuccessStoryProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold" data-testid="text-user-name">{userName}</h3>
              <Badge variant="secondary" className="gap-1" data-testid="badge-karma">
                <Award className="w-3 h-3" />
                +{karmaEarned}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground" data-testid="text-location">{location}</p>
          </div>
        </div>
        <h4 className="font-medium mb-2" data-testid="text-item-name">Reunited: {itemName}</h4>
        <p className="text-sm italic text-muted-foreground" data-testid="text-story">"{story}"</p>
      </CardContent>
    </Card>
  );
}
