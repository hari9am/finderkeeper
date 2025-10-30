import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SafetyTipProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function SafetyTip({ icon: Icon, title, description }: SafetyTipProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2" data-testid="text-tip-title">{title}</h3>
            <p className="text-sm text-muted-foreground" data-testid="text-tip-description">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
