import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Stats } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsOverview from "@/components/dashboard/stats-overview";
import ProgressChart from "@/components/dashboard/progress-chart";
import PlatformBreakdown from "@/components/dashboard/platform-breakdown";
import DifficultySplit from "@/components/dashboard/difficulty-split";
import TopicDistribution from "@/components/dashboard/topic-distribution";
import RecentProblems from "@/components/dashboard/recent-problems";
import AnalysisSelector from "@/components/analysis/analysis-selector";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Fetch user stats
  const { data: stats, isLoading, error } = useQuery<Stats, Error>({
    queryKey: ["/api/stats"],
    refetchOnWindowFocus: false,
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
        <Header title="Dashboard" toggleMobileSidebar={toggleMobileSidebar} />
        
        <div className="p-6 max-w-7xl mx-auto">
          {/* LeetCode Profile Analysis Section */}
          <AnalysisSelector />
          
          {/* Stats Overview */}
          <div className="mt-8">
            <StatsOverview stats={stats} />
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-8">
            <ProgressChart progressData={stats.progressData} />
            <PlatformBreakdown platformBreakdown={stats.platformBreakdown} />
          </div>
          
          {/* Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <DifficultySplit 
              difficultyBreakdown={stats.difficultyBreakdown} 
              totalSolved={stats.totalSolved} 
            />
            <TopicDistribution topicDistribution={stats.topicDistribution} />
          </div>
          
          {/* Recent Problems */}
          <RecentProblems recentProblems={stats.recentProblems} />
        </div>
      </main>
    </div>
  );
}
