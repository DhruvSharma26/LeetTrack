import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useMemo } from "react";
import { Stats } from "@shared/schema";

type PlatformBreakdownProps = {
  platformBreakdown: Stats['platformBreakdown'];
};

export default function PlatformBreakdown({ platformBreakdown }: PlatformBreakdownProps) {
  // Format data for chart
  const chartData = useMemo(() => {
    return Object.entries(platformBreakdown).map(([platform, count]) => ({
      name: platform === "LEETCODE" ? "LeetCode" :
            platform === "CODECHEF" ? "CodeChef" :
            platform === "CODEFORCES" ? "Codeforces" :
            platform === "HACKERRANK" ? "HackerRank" : 
            platform,
      value: count
    }));
  }, [platformBreakdown]);
  
  // Colors for different platforms
  const COLORS = [
    'rgba(59, 130, 246, 0.8)',   // blue for LeetCode
    'rgba(16, 185, 129, 0.8)',   // green for CodeChef
    'rgba(239, 68, 68, 0.8)',    // red for Codeforces
    'rgba(245, 158, 11, 0.8)',   // amber for HackerRank
    'rgba(139, 92, 246, 0.8)',   // purple for Others
  ];
  
  // Format the tooltip content
  const renderTooltipContent = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{`${payload[0].value} problems (${Math.round(payload[0].percent * 100)}%)`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card>
      <CardHeader className="border-b p-5">
        <CardTitle className="text-lg font-semibold">Platform Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 p-5">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={1}
                dataKey="value"
                nameKey="name"
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={renderTooltipContent} />
              <Legend layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
