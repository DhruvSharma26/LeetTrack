import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Stats } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsOverview from "@/components/dashboard/stats-overview";
import ProgressChart from "@/components/dashboard/progress-chart";
import PlatformBreakdown from "@/components/dashboard/platform-breakdown";
import DifficultySplit from "@/components/dashboard/difficulty-split";
import TopicDistribution from "@/components/dashboard/topic-distribution";
import ActivityCalendar from "@/components/dashboard/activity-calendar";
import { Loader2 } from "lucide-react";

export default function StatsPage() {
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Fetch user stats
  const { data: stats, isLoading, error } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    onError: (error: Error) => {
      toast({
        title: "Failed to load statistics",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const toggleMobileSidebar = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">
            There was a problem loading your statistics. Please try again later.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - hidden on mobile unless toggled */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block fixed inset-0 z-50 md:relative md:z-0`}>
        <Sidebar />
        {/* Overlay for mobile */}
        <div 
          className="md:hidden absolute inset-0 bg-black/50" 
          onClick={toggleMobileSidebar}
        />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Header title="Statistics" toggleMobileSidebar={toggleMobileSidebar} />
        
        <div className="p-6 max-w-7xl mx-auto">
          <StatsOverview stats={stats} />
          
          <Tabs defaultValue="progress" className="mt-8">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="progress" className="mt-6">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Problem Solving Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ProgressChart progressData={stats.progressData} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="breakdown" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <PlatformBreakdown platformBreakdown={stats.platformBreakdown} />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Difficulty Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center">
                      <DifficultySplit 
                        difficultyBreakdown={stats.difficultyBreakdown} 
                        totalSolved={stats.totalSolved} 
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Topic Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TopicDistribution topicDistribution={stats.topicDistribution} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityCalendar dailyActivity={stats.dailyActivity} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
