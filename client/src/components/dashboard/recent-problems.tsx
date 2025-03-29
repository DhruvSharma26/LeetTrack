import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stats } from "@shared/schema";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

type RecentProblemsProps = {
  recentProblems: Stats['recentProblems'];
};

export default function RecentProblems({ recentProblems }: RecentProblemsProps) {
  // Helper to get platform display name and colors
  const getPlatformDisplay = (platform: string) => {
    switch (platform) {
      case "LEETCODE":
        return { name: "LeetCode", color: "bg-blue-500" };
      case "CODECHEF":
        return { name: "CodeChef", color: "bg-green-500" };
      case "CODEFORCES":
        return { name: "Codeforces", color: "bg-red-500" };
      case "HACKERRANK":
        return { name: "HackerRank", color: "bg-yellow-500" };
      default:
        return { name: platform, color: "bg-gray-500" };
    }
  };
  
  // Helper to get difficulty badge variant
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return (
          <Badge className="px-2 bg-green-100 text-green-800 hover:bg-green-100">
            Easy
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge className="px-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
            Medium
          </Badge>
        );
      case "HARD":
        return (
          <Badge className="px-2 bg-red-100 text-red-800 hover:bg-red-100">
            Hard
          </Badge>
        );
      default:
        return (
          <Badge className="px-2 bg-gray-100 text-gray-800 hover:bg-gray-100">
            {difficulty}
          </Badge>
        );
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between border-b p-5">
        <CardTitle className="text-lg font-semibold">Recent Problems</CardTitle>
        <Link href="/problem-log">
          <a className="text-blue-500 text-sm hover:underline">
            View All
          </a>
        </Link>
      </CardHeader>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topics</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Solved</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {recentProblems.map((problem) => {
              const platform = getPlatformDisplay(problem.platform);
              
              return (
                <TableRow key={problem.id} className="hover:bg-gray-50">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{problem.title}</div>
                    {problem.platformId && (
                      <div className="text-sm text-gray-500">{problem.platformId}</div>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full ${platform.color} flex items-center justify-center text-white mr-2`}>
                        {platform.name.substring(0, 2)}
                      </div>
                      <div className="text-sm text-gray-500">{platform.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {getDifficultyBadge(problem.difficulty)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {problem.topics.map((topic, index) => (
                        <span key={index} className="px-2 py-1 text-xs rounded bg-gray-100">{topic}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(problem.dateSolved)}
                  </TableCell>
                </TableRow>
              );
            })}
            
            {recentProblems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No problems solved yet. Start adding problems to track your progress!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
