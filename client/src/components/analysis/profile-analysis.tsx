import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart4, Circle, Trophy, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Schema for profile submission
const profileSchema = z.object({
  leetcodeId: z.string().min(1, "LeetCode ID is required"),
});

type ProfileValues = z.infer<typeof profileSchema>;

// Mock profile analysis result type - this would come from the API in the real application
type ProfileAnalysisResult = {
  username: string;
  totalScore: number;
  totalProblems: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  strongTopics: string[];
  weakTopics: string[];
  consistency: number;
  problemSolvingSpeed: number;
  ranking: number;
  recommendations: string[];
};

export default function ProfileAnalysis() {
  const { toast } = useToast();
  const [analysisResult, setAnalysisResult] = useState<ProfileAnalysisResult | null>(null);

  // Create form
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      leetcodeId: "",
    },
  });

  // Mock analysis mutation (would actually call the API in production)
  const analyzeProfileMutation = useMutation({
    mutationFn: async (data: ProfileValues) => {
      // In a real application, this would be an API call
      // const res = await apiRequest("POST", "/api/analyze-profile", data);
      // return await res.json();
      
      // For demo purposes, we'll return mock data after a delay
      // In production, this would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock result
      return {
        username: data.leetcodeId,
        totalScore: 78,
        totalProblems: 342,
        easyCount: 187,
        mediumCount: 124,
        hardCount: 31,
        strongTopics: ["Arrays", "Strings", "Dynamic Programming"],
        weakTopics: ["Graphs", "Trees", "Bit Manipulation"],
        consistency: 65,
        problemSolvingSpeed: 82,
        ranking: 54293,
        recommendations: [
          "Focus on practicing Graph problems",
          "Try more Hard problems to improve your skills",
          "Improve consistency by solving at least one problem daily",
          "Review Binary Tree problem patterns"
        ]
      };
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast({
        title: "Profile analyzed successfully",
        description: `Analysis completed for ${data.username}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to analyze profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: ProfileValues) => {
    analyzeProfileMutation.mutate(data);
  };

  // Helper function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analyze Your LeetCode Profile</CardTitle>
          <CardDescription>
            Enter your LeetCode username to get a detailed analysis of your performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="leetcodeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LeetCode Username</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="Enter your LeetCode username" {...field} />
                      </FormControl>
                      <Button 
                        type="submit" 
                        disabled={analyzeProfileMutation.isPending}
                      >
                        {analyzeProfileMutation.isPending ? "Analyzing..." : "Analyze"}
                      </Button>
                    </div>
                    <FormDescription>
                      Your profile must be public to analyze
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analyzeProfileMutation.isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Analyzing Profile</CardTitle>
            <CardDescription>
              Please wait while we analyze your LeetCode performance...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Analysis for {analysisResult.username}</CardTitle>
                <Badge className="text-lg py-2 px-3">
                  Score: <span className={getScoreColor(analysisResult.totalScore)}>{analysisResult.totalScore}/100</span>
                </Badge>
              </div>
              <CardDescription>
                Based on your LeetCode activity and problem-solving patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Problem Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <BarChart4 className="h-8 w-8 mb-2 text-blue-500" />
                      <h3 className="font-medium text-lg">{analysisResult.totalProblems}</h3>
                      <p className="text-sm text-muted-foreground">Problems Solved</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Trophy className="h-8 w-8 mb-2 text-blue-500" />
                      <h3 className="font-medium text-lg">#{analysisResult.ranking}</h3>
                      <p className="text-sm text-muted-foreground">Global Ranking</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Users className="h-8 w-8 mb-2 text-blue-500" />
                      <h3 className="font-medium text-lg">{analysisResult.consistency}%</h3>
                      <p className="text-sm text-muted-foreground">Consistency Score</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Difficulty Breakdown */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-base">Problem Difficulty Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-green-500">Easy</span>
                        <span className="text-sm font-medium text-gray-700">
                          {analysisResult.easyCount} problems
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${(analysisResult.easyCount / analysisResult.totalProblems) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-amber-500">Medium</span>
                        <span className="text-sm font-medium text-gray-700">
                          {analysisResult.mediumCount} problems
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full" 
                          style={{ width: `${(analysisResult.mediumCount / analysisResult.totalProblems) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-red-500">Hard</span>
                        <span className="text-sm font-medium text-gray-700">
                          {analysisResult.hardCount} problems
                        </span>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full" 
                          style={{ width: `${(analysisResult.hardCount / analysisResult.totalProblems) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle className="text-base">Strong Areas</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.strongTopics.map((topic, index) => (
                        <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-100">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle className="text-base">Areas to Improve</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.weakTopics.map((topic, index) => (
                        <Badge key={index} className="bg-red-100 text-red-800 hover:bg-red-100">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recommendations */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-base">Recommendations to Improve</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-2">
                    {analysisResult.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Circle className="h-2 w-2 mt-2 text-blue-500" fill="currentColor" />
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}