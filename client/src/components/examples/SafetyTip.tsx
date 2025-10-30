import SafetyTip from "../SafetyTip";
import { MapPin, Users, Shield, Camera } from "lucide-react";

export default function SafetyTipExample() {
  return (
    <div className="p-8 space-y-4 max-w-2xl">
      <SafetyTip
        icon={MapPin}
        title="Meet in Public Places"
        description="Always arrange meetups in well-lit, public locations like coffee shops, police stations, or busy shopping centers."
      />
      <SafetyTip
        icon={Users}
        title="Bring a Friend"
        description="Consider bringing someone with you when meeting to exchange items, especially for high-value belongings."
      />
      <SafetyTip
        icon={Shield}
        title="Verify Identity"
        description="Ask for specific details about the item that only the true owner would know before arranging a meetup."
      />
      <SafetyTip
        icon={Camera}
        title="Document Everything"
        description="Take photos of items when you find them and keep records of all communications through our platform."
      />
    </div>
  );
}
