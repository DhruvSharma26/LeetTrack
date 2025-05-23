import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import ProblemList from "@/components/problem/problem-list";

export default function ProblemLogPage() {
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
        <Header title="Problem Log" toggleMobileSidebar={toggleMobileSidebar} />
        
        <div className="p-6 max-w-7xl mx-auto">
          <ProblemList />
        </div>
      </main>
    </div>
  );
}
