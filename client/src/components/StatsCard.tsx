import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

export default function StatsCard({ title, value, icon: Icon }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground" data-testid="text-stat-title">
            {title}
          </span>
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="text-3xl font-bold" data-testid="text-stat-value">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
