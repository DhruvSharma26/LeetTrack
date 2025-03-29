import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Stats } from "@shared/schema";
import { useMemo } from "react";

type TopicDistributionProps = {
  topicDistribution: Stats['topicDistribution'];
};

export default function TopicDistribution({ topicDistribution }: TopicDistributionProps) {
  // Calculate total problems across all topics
  const totalProblems = useMemo(() => {
    return topicDistribution.reduce((sum, topic) => sum + topic.count, 0);
  }, [topicDistribution]);
  
  // Get top 5 topics
  const topTopics = useMemo(() => {
    return [...topicDistribution]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [topicDistribution]);
  
  // Calculate "Other Topics" if there are more than 5 topics
  const otherTopics = useMemo(() => {
    if (topicDistribution.length <= 5) return null;
    
    const otherCount = totalProblems - topTopics.reduce((sum, topic) => sum + topic.count, 0);
    
    return {
      name: "Other Topics",
      count: otherCount
    };
  }, [topicDistribution, topTopics, totalProblems]);
  
  // Create final display array
  const displayTopics = useMemo(() => {
    const result = [...topTopics];
    if (otherTopics) result.push(otherTopics);
    return result;
  }, [topTopics, otherTopics]);
  
  return (
    <Card>
      <CardHeader className="border-b p-5">
        <CardTitle className="text-lg font-semibold">Topic Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          {displayTopics.map((topic) => {
            const percent = totalProblems ? Math.round((topic.count / totalProblems) * 100) : 0;
            
            return (
              <div key={topic.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{topic.name}</span>
                  <span className="text-sm font-medium text-gray-700">{topic.count} problems</span>
                </div>
                <Progress value={percent} className="h-2.5 bg-gray-200" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
