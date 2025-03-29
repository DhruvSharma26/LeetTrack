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
import { BarChart4, CircleCheck, Plus, Trash2, Trophy, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Schema for profile submission
const profileComparisonSchema = z.object({
  usernames: z.array(z.string()).min(2, "At least two usernames are required for comparison"),
});

type ProfileComparisonValues = z.infer<typeof profileComparisonSchema>;

// Mock profile analysis result type
type ProfileComparisonResult = {
  profiles: {
    username: string;
    totalScore: number;
    totalProblems: number;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
    strongTopics: string[];
    consistency: number;
    ranking: number;
  }[];
  commonTopics: string[];
  analysis: string;
};

export default function ProfileComparison() {
  const { toast } = useToast();
  const [inputUsername, setInputUsername] = useState("");
  const [comparisonResult, setComparisonResult] = useState<ProfileComparisonResult | null>(null);
  const [usernames, setUsernames] = useState<string[]>([]);

  // Create form
  const form = useForm<ProfileComparisonValues>({
    resolver: zodResolver(profileComparisonSchema),
    defaultValues: {
      usernames: [],
    },
  });

  // Add username to list
  const addUsername = () => {
    if (!inputUsername.trim()) return;
    
    // Check if username already exists
    if (usernames.includes(inputUsername.trim())) {
      toast({
        title: "Username already added",
        description: "Please add different usernames for comparison",
        variant: "destructive",
      });
      return;
    }
    
    const newUsernames = [...usernames, inputUsername.trim()];
    setUsernames(newUsernames);
    form.setValue("usernames", newUsernames);
    setInputUsername("");
  };

  // Remove username from list
  const removeUsername = (index: number) => {
    const newUsernames = usernames.filter((_, i) => i !== index);
    setUsernames(newUsernames);
    form.setValue("usernames", newUsernames);
  };

  // Mock comparison mutation
  const compareProfilesMutation = useMutation({
    mutationFn: async (data: ProfileComparisonValues) => {
      // In a real application, this would be an API call
      // const res = await apiRequest("POST", "/api/compare-profiles", data);
      // return await res.json();
      
      // For demo purposes, we'll return mock data after a delay
      // In production, this would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock data for each username
      const profiles = data.usernames.map((username, index) => {
        // Mock variable values for each user to make it interesting
        const baseScore = 65 + (index * 5) % 30;
        const problemCount = 200 + (index * 50) % 300;
        const easyPercent = 40 + (index * 5) % 30;
        const mediumPercent = 30 + (index * 7) % 40;
        const hardPercent = 100 - easyPercent - mediumPercent;
        
        return {
          username,
          totalScore: baseScore,
          totalProblems: problemCount,
          easyCount: Math.round(problemCount * (easyPercent / 100)),
          mediumCount: Math.round(problemCount * (mediumPercent / 100)),
          hardCount: Math.round(problemCount * (hardPercent / 100)),
          strongTopics: ["Arrays", "Dynamic Programming", "Binary Search"].slice(0, 2 + (index % 2)),
          consistency: 60 + (index * 8) % 30,
          ranking: 50000 - (index * 10000),
        };
      });
      
      return {
        profiles,
        commonTopics: ["Arrays", "Strings"],
        analysis: "Based on the profiles compared, there's a significant difference in problem-solving patterns and efficiency. Some users excel at harder problems while others have solved more problems overall. The consistency in problem solving varies across profiles."
      };
    },
    onSuccess: (data) => {
      setComparisonResult(data);
      toast({
        title: "Profiles compared successfully",
        description: `Compared ${data.profiles.length} LeetCode profiles`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to compare profiles",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: ProfileComparisonValues) => {
    compareProfilesMutation.mutate(data);
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
          <CardTitle>Compare LeetCode Profiles</CardTitle>
          <CardDescription>
            Compare multiple LeetCode profiles to see how they stack up against each other
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <FormLabel>LeetCode Usernames</FormLabel>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter a LeetCode username" 
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addUsername();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={addUsername}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <FormDescription>
                Add at least two usernames to compare profiles
              </FormDescription>
              
              {/* Error message */}
              {form.formState.errors.usernames && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.usernames.message}
                </p>
              )}
              
              {/* Selected usernames */}
              {usernames.length > 0 && (
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">Profiles to compare:</h3>
                  <div className="space-y-2">
                    {usernames.map((username, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <span>{username}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeUsername(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={compareProfilesMutation.isPending || usernames.length < 2}
              className="w-full"
            >
              {compareProfilesMutation.isPending ? "Comparing Profiles..." : "Compare Profiles"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {compareProfilesMutation.isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Comparing Profiles</CardTitle>
            <CardDescription>
              Please wait while we analyze and compare the profiles...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-72 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      )}

      {comparisonResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Comparison Results</CardTitle>
              <CardDescription>
                Detailed comparison of the selected LeetCode profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Trophy className="h-8 w-8 mb-2 text-blue-500" />
                      <h3 className="font-medium text-lg">
                        {comparisonResult.profiles.length}
                      </h3>
                      <p className="text-sm text-muted-foreground">Profiles Compared</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <CircleCheck className="h-8 w-8 mb-2 text-blue-500" />
                      <h3 className="font-medium text-lg">
                        {comparisonResult.commonTopics.length}
                      </h3>
                      <p className="text-sm text-muted-foreground">Common Topics</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center">
                      <BarChart4 className="h-8 w-8 mb-2 text-blue-500" />
                      <h3 className="font-medium text-lg">
                        {Math.max(...comparisonResult.profiles.map(p => p.totalScore))}
                      </h3>
                      <p className="text-sm text-muted-foreground">Top Score</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Comparison table */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-base">Profile Comparison Table</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Username</TableHead>
                        <TableHead className="text-right">Total Score</TableHead>
                        <TableHead className="text-right">Problems Solved</TableHead>
                        <TableHead className="text-right">Easy</TableHead>
                        <TableHead className="text-right">Medium</TableHead>
                        <TableHead className="text-right">Hard</TableHead>
                        <TableHead className="text-right">Consistency</TableHead>
                        <TableHead className="text-right">Ranking</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparisonResult.profiles.map((profile) => (
                        <TableRow key={profile.username}>
                          <TableCell className="font-medium">{profile.username}</TableCell>
                          <TableCell className={`text-right ${getScoreColor(profile.totalScore)}`}>
                            {profile.totalScore}/100
                          </TableCell>
                          <TableCell className="text-right">{profile.totalProblems}</TableCell>
                          <TableCell className="text-right text-green-500">{profile.easyCount}</TableCell>
                          <TableCell className="text-right text-amber-500">{profile.mediumCount}</TableCell>
                          <TableCell className="text-right text-red-500">{profile.hardCount}</TableCell>
                          <TableCell className="text-right">{profile.consistency}%</TableCell>
                          <TableCell className="text-right">#{profile.ranking}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
              
              {/* Visualization of problem counts */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-base">Problems Solved Comparison</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {comparisonResult.profiles.map((profile) => (
                      <div key={profile.username} className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{profile.username}</span>
                          <span className="text-sm text-muted-foreground">
                            {profile.totalProblems} problems total
                          </span>
                        </div>
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div className="flex">
                              <div className="text-xs inline-block py-1 px-2 uppercase rounded-full bg-green-100 text-green-800 mr-1">
                                Easy
                              </div>
                              <div className="text-xs inline-block py-1 px-2 uppercase rounded-full bg-amber-100 text-amber-800 mr-1">
                                Medium
                              </div>
                              <div className="text-xs inline-block py-1 px-2 uppercase rounded-full bg-red-100 text-red-800">
                                Hard
                              </div>
                            </div>
                          </div>
                          <div className="flex h-2 mb-0 overflow-hidden text-xs rounded">
                            <div 
                              style={{width: `${(profile.easyCount / profile.totalProblems) * 100}%`}}
                              className="bg-green-500"
                            ></div>
                            <div 
                              style={{width: `${(profile.mediumCount / profile.totalProblems) * 100}%`}}
                              className="bg-amber-500"
                            ></div>
                            <div 
                              style={{width: `${(profile.hardCount / profile.totalProblems) * 100}%`}}
                              className="bg-red-500"
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Common topics */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-base">Common Strong Topics</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    {comparisonResult.commonTopics.map((topic, index) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        {topic}
                      </Badge>
                    ))}
                    {comparisonResult.commonTopics.length === 0 && (
                      <p className="text-muted-foreground">No common topics found between these profiles</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Analysis */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-base">Comparison Analysis</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p>{comparisonResult.analysis}</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}