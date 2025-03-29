import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Settings, 
  Code,
  LogOut
} from "lucide-react";

type SidebarLinkProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  currentPath: string;
};

const SidebarLink = ({ href, icon, children, currentPath }: SidebarLinkProps) => {
  const isActive = currentPath === href;
  
  return (
    <Link href={href}>
      <a 
        className={cn(
          "block px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 flex items-center space-x-2",
          isActive && "bg-gray-700 text-white"
        )}
      >
        {icon}
        <span>{children}</span>
      </a>
    </Link>
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  return (
    <aside className="w-full md:w-64 bg-gray-800 text-white flex flex-col min-h-screen h-full">
      <div className="p-4 border-b border-gray-700 flex items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
            <Code size={20} />
          </div>
          <h1 className="font-semibold text-xl">LeetTrack</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <SidebarLink 
          href="/" 
          icon={<Home size={20} />} 
          currentPath={location}
        >
          LeetCode Analysis
        </SidebarLink>
        
        <SidebarLink 
          href="/settings" 
          icon={<Settings size={20} />} 
          currentPath={location}
        >
          Settings
        </SidebarLink>
      </nav>
      
      {user && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
              <span>{user.username.slice(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={() => logoutMutation.mutate()}
            className="mt-3 flex items-center text-sm text-gray-300 hover:text-white px-2 py-1 rounded-md hover:bg-gray-700 w-full"
          >
            <LogOut size={16} className="mr-2" /> Logout
          </button>
        </div>
      )}
    </aside>
  );
}
