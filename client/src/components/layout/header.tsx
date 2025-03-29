import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Bell, ChevronDown, Menu } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";

type HeaderProps = {
  title: string;
  toggleMobileSidebar: () => void;
};

export default function Header({ title, toggleMobileSidebar }: HeaderProps) {
  const { logoutMutation } = useAuth();
  const [timeFilter, setTimeFilter] = useState("Last 30 days");

  const timeFilters = [
    "Last 7 days",
    "Last 30 days",
    "Last 90 days",
    "Last 12 months",
    "All time"
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileSidebar}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold hidden md:block">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-gray-500" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 text-sm">
                <span>{timeFilter}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {timeFilters.map((filter) => (
                <DropdownMenuItem 
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                >
                  {filter}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
