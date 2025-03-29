import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Problem, difficultyEnum, platformEnum } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ExternalLink, Search } from "lucide-react";

type ProblemWithTopics = Problem & { topics: string[] };

export default function ProblemList() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [difficulty, setDifficulty] = useState<string>("ALL");
  const [platform, setPlatform] = useState<string>("ALL");
  const [topicFilter, setTopicFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("date_desc");
  const pageSize = 10;
  
  // Fetch problems
  const { data: problems = [], isLoading } = useQuery<ProblemWithTopics[]>({
    queryKey: ["/api/problems"],
    onError: (error: Error) => {
      toast({
        title: "Failed to load problems",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Extract all unique topics from problems
  const allTopics = useMemo(() => {
    const topicsSet = new Set<string>();
    problems.forEach(problem => {
      problem.topics?.forEach(topic => topicsSet.add(topic));
    });
    return Array.from(topicsSet).sort();
  }, [problems]);
  
  // Filter problems
  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      // Filter by search term
      const matchesSearch = 
        search === "" ||
        problem.title.toLowerCase().includes(search.toLowerCase()) ||
        problem.platformId?.toLowerCase().includes(search.toLowerCase()) ||
        problem.topics.some(topic => topic.toLowerCase().includes(search.toLowerCase()));
      
      // Filter by difficulty
      const matchesDifficulty = difficulty === "ALL" || problem.difficulty === difficulty;
      
      // Filter by platform
      const matchesPlatform = platform === "ALL" || problem.platform === platform;
      
      // Filter by topic
      const matchesTopic = topicFilter === "ALL" || problem.topics.includes(topicFilter);
      
      return matchesSearch && matchesDifficulty && matchesPlatform && matchesTopic;
    });
  }, [problems, search, difficulty, platform, topicFilter]);
  
  // Sort problems
  const sortedProblems = useMemo(() => {
    return [...filteredProblems].sort((a, b) => {
      switch (sortBy) {
        case "date_asc":
          return new Date(a.dateSolved).getTime() - new Date(b.dateSolved).getTime();
        case "date_desc":
          return new Date(b.dateSolved).getTime() - new Date(a.dateSolved).getTime();
        case "title_asc":
          return a.title.localeCompare(b.title);
        case "title_desc":
          return b.title.localeCompare(a.title);
        case "difficulty_asc":
          return difficultyEnum.options.indexOf(a.difficulty) - difficultyEnum.options.indexOf(b.difficulty);
        case "difficulty_desc":
          return difficultyEnum.options.indexOf(b.difficulty) - difficultyEnum.options.indexOf(a.difficulty);
        default:
          return 0;
      }
    });
  }, [filteredProblems, sortBy]);
  
  // Paginate problems
  const paginatedProblems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedProblems.slice(startIndex, startIndex + pageSize);
  }, [sortedProblems, currentPage, pageSize]);
  
  const totalPages = Math.max(1, Math.ceil(sortedProblems.length / pageSize));
  
  // Helper to get difficulty badge
  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Easy</Badge>;
      case "MEDIUM":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Medium</Badge>;
      case "HARD":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Hard</Badge>;
      default:
        return <Badge>{difficulty}</Badge>;
    }
  };
  
  // Helper to get platform display
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
    <Card>
      <CardHeader>
        <CardTitle>Problem Log</CardTitle>
        <CardDescription>
          Browse and search through all your solved coding problems.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search problems..."
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <Select
            value={difficulty}
            onValueChange={(value) => {
              setDifficulty(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Difficulties</SelectItem>
              {difficultyEnum.options.map(diff => (
                <SelectItem key={diff} value={diff}>
                  {diff === "EASY" ? "Easy" : diff === "MEDIUM" ? "Medium" : "Hard"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={platform}
            onValueChange={(value) => {
              setPlatform(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Platforms</SelectItem>
              {platformEnum.options.map(plat => (
                <SelectItem key={plat} value={plat}>
                  {plat === "LEETCODE" ? "LeetCode" : 
                   plat === "CODECHEF" ? "CodeChef" : 
                   plat === "CODEFORCES" ? "Codeforces" : 
                   plat === "HACKERRANK" ? "HackerRank" : plat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Newest First</SelectItem>
              <SelectItem value="date_asc">Oldest First</SelectItem>
              <SelectItem value="title_asc">Title (A-Z)</SelectItem>
              <SelectItem value="title_desc">Title (Z-A)</SelectItem>
              <SelectItem value="difficulty_asc">Difficulty (Easy-Hard)</SelectItem>
              <SelectItem value="difficulty_desc">Difficulty (Hard-Easy)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Topic Filter */}
        {allTopics.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge 
              variant={topicFilter === "ALL" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                setTopicFilter("ALL");
                setCurrentPage(1);
              }}
            >
              All Topics
            </Badge>
            {allTopics.map(topic => (
              <Badge 
                key={topic}
                variant={topicFilter === topic ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setTopicFilter(topic);
                  setCurrentPage(1);
                }}
              >
                {topic}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Results summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedProblems.length} of {filteredProblems.length} problems
          </p>
        </div>
        
        {/* Problems Table */}
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Problem</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Topics</TableHead>
                <TableHead>Date Solved</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading problems...
                  </TableCell>
                </TableRow>
              ) : paginatedProblems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {filteredProblems.length === 0 ? (
                      search || difficulty !== "ALL" || platform !== "ALL" || topicFilter !== "ALL" ? (
                        "No problems match your filters. Try adjusting your search criteria."
                      ) : (
                        "No problems added yet. Start adding your solved problems!"
                      )
                    ) : (
                      "No problems on this page."
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProblems.map((problem) => {
                  const platformDisplay = getPlatformDisplay(problem.platform);
                  
                  return (
                    <TableRow key={problem.id}>
                      <TableCell>
                        <div className="font-medium">{problem.title}</div>
                        {problem.platformId && (
                          <div className="text-sm text-muted-foreground">{problem.platformId}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded-full ${platformDisplay.color} flex items-center justify-center text-white text-xs`}>
                            {platformDisplay.name.substring(0, 2)}
                          </div>
                          <span>{platformDisplay.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getDifficultyBadge(problem.difficulty)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {problem.topics?.map((topic, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(problem.dateSolved)}</TableCell>
                      <TableCell>
                        {problem.url && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            asChild
                          >
                            <a 
                              href={problem.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1"
                            >
                              <ExternalLink size={14} />
                              <span className="sr-only md:not-sr-only md:inline-block">View</span>
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                )
                .map((page, i, array) => {
                  // Add ellipsis if there's a gap
                  const prevPage = array[i - 1];
                  const showEllipsisBefore = prevPage && page - prevPage > 1;
                  
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsisBefore && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    </div>
                  );
                })}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  aria-disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  );
}
