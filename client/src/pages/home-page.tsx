import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import AnalysisSelector from "@/components/analysis/analysis-selector";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileSidebar = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
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
        <Header title="LeetCode Analyzer" toggleMobileSidebar={toggleMobileSidebar} />
        
        <div className="p-6 max-w-7xl mx-auto">
          {/* LeetCode Profile Analysis Section */}
          <AnalysisSelector />
        </div>
      </main>
    </div>
  );
}
