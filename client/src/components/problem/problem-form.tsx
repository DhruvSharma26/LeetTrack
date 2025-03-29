import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Plus, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  platformEnum, 
  difficultyEnum, 
  ProblemFormValues,
  problemFormSchema, 
  Topic
} from "@shared/schema";

export default function ProblemForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [topicInput, setTopicInput] = useState("");
  
  // Fetch existing topics
  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
    enabled: !!user,
  });
  
  const topicNames = topics.map(t => t.name);
  
  // Create a form
  const form = useForm<ProblemFormValues>({
    resolver: zodResolver(problemFormSchema),
    defaultValues: {
      title: "",
      platformId: "",
      platform: "LEETCODE",
      difficulty: "MEDIUM",
      dateSolved: new Date().toISOString().split('T')[0],
      notes: "",
      url: "",
      topics: [],
    },
  });
  
  // Add problem mutation
  const addProblemMutation = useMutation({
    mutationFn: async (data: ProblemFormValues) => {
      const res = await apiRequest("POST", "/api/problems", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Problem added successfully",
        description: "Your solved problem has been recorded.",
      });
      
      // Reset form
      form.reset({
        title: "",
        platformId: "",
        platform: "LEETCODE",
        difficulty: "MEDIUM",
        dateSolved: new Date().toISOString().split('T')[0],
        notes: "",
        url: "",
        topics: [],
      });
      
      // Invalidate stats and problems queries
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/problems"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add problem",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: ProblemFormValues) => {
    // Set user ID (will be overridden by server)
    const formData = {
      ...data,
      userId: user?.id || 0,
    };
    
    addProblemMutation.mutate(formData);
  };
  
  // Handle adding a topic
  const handleAddTopic = () => {
    if (!topicInput.trim()) return;
    
    const formattedTopic = topicInput.trim();
    const currentTopics = form.getValues("topics") || [];
    
    if (!currentTopics.includes(formattedTopic)) {
      form.setValue("topics", [...currentTopics, formattedTopic]);
    }
    
    setTopicInput("");
  };
  
  // Handle removing a topic
  const handleRemoveTopic = (topic: string) => {
    const currentTopics = form.getValues("topics") || [];
    form.setValue(
      "topics", 
      currentTopics.filter(t => t !== topic)
    );
  };
  
  // Handle selecting a suggested topic
  const handleSelectTopic = (topic: string) => {
    const currentTopics = form.getValues("topics") || [];
    
    if (!currentTopics.includes(topic)) {
      form.setValue("topics", [...currentTopics, topic]);
    }
    
    setTopicInput("");
  };
  
  // Filter suggested topics based on input
  const filteredTopics = topicNames.filter(
    topic => 
      !form.getValues("topics")?.includes(topic) && 
      topic.toLowerCase().includes(topicInput.toLowerCase())
  );
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Solved Problem</CardTitle>
        <CardDescription>
          Record your coding achievements to track your progress.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Two Sum" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Platform */}
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {platformEnum.options.map(platform => (
                          <SelectItem key={platform} value={platform}>
                            {platform === "LEETCODE" ? "LeetCode" :
                             platform === "CODECHEF" ? "CodeChef" :
                             platform === "CODEFORCES" ? "Codeforces" :
                             platform === "HACKERRANK" ? "HackerRank" : 
                             platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Platform ID */}
              <FormField
                control={form.control}
                name="platformId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problem ID</FormLabel>
                    <FormControl>
                      <Input placeholder="#1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional problem number/ID
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Difficulty */}
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {difficultyEnum.options.map(difficulty => (
                          <SelectItem 
                            key={difficulty} 
                            value={difficulty}
                            className={
                              difficulty === "EASY" ? "text-green-500" :
                              difficulty === "MEDIUM" ? "text-amber-500" :
                              "text-red-500"
                            }
                          >
                            {difficulty === "EASY" ? "Easy" :
                             difficulty === "MEDIUM" ? "Medium" :
                             "Hard"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Date Solved */}
              <FormField
                control={form.control}
                name="dateSolved"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date Solved</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(field.value)}
                          onSelect={(date) => field.onChange(date?.toISOString().split('T')[0] || '')}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* URL */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://leetcode.com/problems/two-sum/" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional link to the problem
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Topics */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="topics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topics</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input 
                            placeholder="Array, Hash Table, etc." 
                            value={topicInput}
                            onChange={(e) => setTopicInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTopic();
                              }
                            }}
                          />
                        </FormControl>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={handleAddTopic}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Topic suggestions */}
                      {topicInput && filteredTopics.length > 0 && (
                        <div className="mt-1 border rounded-md p-2 bg-background">
                          <p className="text-xs text-muted-foreground mb-1">Suggestions:</p>
                          <div className="flex flex-wrap gap-1">
                            {filteredTopics.slice(0, 8).map(topic => (
                              <Badge 
                                key={topic} 
                                variant="outline"
                                className="cursor-pointer hover:bg-accent"
                                onClick={() => handleSelectTopic(topic)}
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Selected topics */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {field.value?.map(topic => (
                          <Badge 
                            key={topic} 
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {topic}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => handleRemoveTopic(topic)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <FormDescription>
                        Add relevant topics for this problem
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Notes */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any notes or solution approach here..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional notes about your approach or solution
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <CardFooter className="px-0 flex justify-end">
              <Button 
                type="submit"
                className="w-full md:w-auto"
                disabled={addProblemMutation.isPending}
              >
                {addProblemMutation.isPending ? "Saving..." : "Save Problem"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
