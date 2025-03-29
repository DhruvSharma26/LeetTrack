import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Stats } from "@shared/schema";

type DifficultySplitProps = {
  difficultyBreakdown: Stats['difficultyBreakdown'];
  totalSolved: number;
};

export default function DifficultySplit({ difficultyBreakdown, totalSolved }: DifficultySplitProps) {
  // Calculate percentages
  const easyPercent = totalSolved ? Math.round((difficultyBreakdown.easy / totalSolved) * 100) : 0;
  const mediumPercent = totalSolved ? Math.round((difficultyBreakdown.medium / totalSolved) * 100) : 0;
  const hardPercent = totalSolved ? Math.round((difficultyBreakdown.hard / totalSolved) * 100) : 0;
  
  return (
    <Card>
      <CardHeader className="border-b p-5">
        <CardTitle className="text-lg font-semibold">Difficulty Split</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-green-500">Easy</span>
              <span className="text-sm font-medium text-gray-700">
                {difficultyBreakdown.easy} problems ({easyPercent}%)
              </span>
            </div>
            <Progress value={easyPercent} className="h-2.5 bg-gray-200" indicatorClassName="bg-green-500" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-amber-500">Medium</span>
              <span className="text-sm font-medium text-gray-700">
                {difficultyBreakdown.medium} problems ({mediumPercent}%)
              </span>
            </div>
            <Progress value={mediumPercent} className="h-2.5 bg-gray-200" indicatorClassName="bg-amber-500" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-red-500">Hard</span>
              <span className="text-sm font-medium text-gray-700">
                {difficultyBreakdown.hard} problems ({hardPercent}%)
              </span>
            </div>
            <Progress value={hardPercent} className="h-2.5 bg-gray-200" indicatorClassName="bg-red-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
