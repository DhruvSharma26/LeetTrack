import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  CheckCircle, 
  Zap, 
  BarChart2, 
  Lock,
  ArrowUpRight 
} from "lucide-react";
import { Stats } from "@shared/schema";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: string;
    label: string;
    increase: boolean;
  };
};

const StatCard = ({ title, value, icon, change }: StatCardProps) => {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-semibold mt-1">{value}</p>
          </div>
          <div className={
            title === "Problems Solved" ? "rounded-full bg-blue-100 p-3" :
            title === "Current Streak" ? "rounded-full bg-yellow-100 p-3" :
            title === "Weekly Average" ? "rounded-full bg-green-100 p-3" :
            "rounded-full bg-red-100 p-3"
          }>
            {icon}
          </div>
        </div>
        
        {change && (
          <div className="mt-3 flex items-center text-sm">
            <span className={`font-medium flex items-center ${change.increase ? 'text-green-500' : 'text-red-500'}`}>
              <ArrowUpRight className={`h-5 w-5 mr-1 ${!change.increase && 'rotate-180'}`} />
              {change.value}
            </span>
            <span className="text-gray-500 ml-2">{change.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

type StatsOverviewProps = {
  stats: Stats;
};

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Problems Solved"
        value={stats.totalSolved}
        icon={<CheckCircle className="h-6 w-6 text-blue-500" />}
        change={{
          value: "+14%",
          label: "from last month",
          increase: true
        }}
      />
      
      <StatCard
        title="Current Streak"
        value={`${stats.currentStreak} days`}
        icon={<Zap className="h-6 w-6 text-yellow-500" />}
        change={{
          value: "+3 days",
          label: "from last streak",
          increase: true
        }}
      />
      
      <StatCard
        title="Weekly Average"
        value={stats.weeklyAverage?.toFixed(1) || "0.0"}
        icon={<BarChart2 className="h-6 w-6 text-green-500" />}
        change={{
          value: "+0.3",
          label: "from last week",
          increase: true
        }}
      />
      
      <StatCard
        title="Hard Problems"
        value={stats.difficultyBreakdown.hard}
        icon={<Lock className="h-6 w-6 text-red-500" />}
      />
    </div>
  );
}
