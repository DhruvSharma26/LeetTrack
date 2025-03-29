import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { Stats } from "@shared/schema";

type ProgressChartProps = {
  progressData: Stats['progressData'];
};

export default function ProgressChart({ progressData }: ProgressChartProps) {
  const [timeRange, setTimeRange] = useState("30");
  
  // Format dates for display
  const formattedData = useMemo(() => {
    return progressData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      count: item.count
    }));
  }, [progressData]);
  
  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    if (timeRange === "all") return formattedData;
    
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Need at least 2 points for a line chart
    if (formattedData.length <= 2) return formattedData;
    
    // Return at least the first and last points, plus any in the selected range
    const firstPoint = formattedData[0];
    const lastPoint = formattedData[formattedData.length - 1];
    
    const filtered = formattedData.filter((_, index) => {
      // Always include first and last points
      if (index === 0 || index === formattedData.length - 1) return true;
      
      // Include points within selected range
      const date = new Date(progressData[index].date);
      return date >= cutoffDate;
    });
    
    return filtered;
  }, [formattedData, timeRange, progressData]);
  
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between border-b p-5">
        <CardTitle className="text-lg font-semibold">Problem Solving Progress</CardTitle>
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last 12 months</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-6 p-5">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickCount={5}
              />
              <YAxis 
                domain={['dataMin', 'dataMax']}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '8px'
                }}
                itemStyle={{ fontSize: '12px', color: '#3B82F6' }}
                labelStyle={{ fontWeight: 500, marginBottom: '4px' }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Problems Solved"
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                isAnimationActive={true}
                fill="rgba(59, 130, 246, 0.1)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
