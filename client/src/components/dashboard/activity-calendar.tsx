import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stats } from "@shared/schema";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

type ActivityCalendarProps = {
  dailyActivity: Stats['dailyActivity'];
};

export default function ActivityCalendar({ dailyActivity }: ActivityCalendarProps) {
  // Get the max count for scaling colors
  const maxCount = useMemo(() => {
    return Math.max(...dailyActivity.map(day => day.count), 1);
  }, [dailyActivity]);
  
  // Get green intensity based on count (0-5 scale)
  const getColorClass = (count: number) => {
    if (count === 0) return "bg-gray-100";
    
    // Scale from 1 to 5
    const intensity = Math.min(Math.ceil((count / maxCount) * 5), 5);
    
    switch (intensity) {
      case 1: return "bg-green-100";
      case 2: return "bg-green-200";
      case 3: return "bg-green-300";
      case 4: return "bg-green-400";
      case 5: return "bg-green-500";
      default: return "bg-gray-100";
    }
  };
  
  // Organize by week (assuming dailyActivity is sorted chronologically)
  const calendarGrid = useMemo(() => {
    // Get the most recent 31 days
    const recentActivity = dailyActivity.slice(-31);
    
    // Create weekly groups
    const weeks = [];
    let currentWeek = [];
    
    for (const day of recentActivity) {
      currentWeek.push(day);
      
      // Start new week every 7 days
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Add any remaining days
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [dailyActivity]);
  
  return (
    <Card>
      <CardHeader className="border-b p-5">
        <CardTitle className="text-lg font-semibold">Monthly Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-7 gap-1">
          {dailyActivity.map((day, index) => (
            <div
              key={index}
              className={cn(
                "aspect-square h-6 rounded",
                getColorClass(day.count)
              )}
              title={`${new Date(day.date).toLocaleDateString()} - ${day.count} problem${day.count !== 1 ? 's' : ''}`}
            />
          ))}
        </div>
        <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <div className="w-3 h-3 bg-green-300 rounded"></div>
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <div className="w-3 h-3 bg-green-500 rounded"></div>
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
