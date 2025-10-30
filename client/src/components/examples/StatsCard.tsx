import StatsCard from "../StatsCard";
import { Package, CheckCircle, TrendingUp, Award } from "lucide-react";

export default function StatsCardExample() {
  return (
    <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatsCard title="Total Posts" value="1,247" icon={Package} />
      <StatsCard title="Active Items" value="342" icon={TrendingUp} />
      <StatsCard title="Successful Matches" value="856" icon={CheckCircle} />
      <StatsCard title="Karma Points" value="128" icon={Award} />
    </div>
  );
}
