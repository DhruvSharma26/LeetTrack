import { useAuth } from "@/hooks/use-auth";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

type HeaderProps = {
  title: string;
  toggleMobileSidebar: () => void;
};

export default function Header({ title, toggleMobileSidebar }: HeaderProps) {
  const { logoutMutation } = useAuth();
  
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
        
        <div className="flex items-center">
          {/* User account/profile functionality can be added here if needed */}
        </div>
      </div>
    </header>
  );
}
