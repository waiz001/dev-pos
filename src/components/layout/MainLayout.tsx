
import React, { ReactNode, useEffect, useState } from "react";
import { BellRing, Menu, Search, User, LogOut, UserPlus, Settings, Users, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isPOSSession, setIsPOSSession] = useState(false);
  
  useEffect(() => {
    // Detect if we're in a POS session
    setIsPOSSession(location.pathname === "/pos-session");
  }, [location.pathname]);
  
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    if (isPOSSession) {
      toast.warning("Please close the POS session before navigating away", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }
    navigate(path);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-900 lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <span className="text-xl font-semibold">POS System</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-auto p-4">
            <nav className="space-y-1">
              <button
                onClick={() => handleNavigation("/")}
                className={`w-full flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                  isActiveRoute("/") 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <span>Dashboard</span>
              </button>
              
              {currentUser?.permissions.orders && (
                <button
                  onClick={() => handleNavigation("/pos-shop")}
                  className={`w-full flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    isActiveRoute("/pos-shop") 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span>POS Shop</span>
                </button>
              )}
              
              {currentUser?.permissions.products && (
                <button
                  onClick={() => handleNavigation("/products")}
                  className={`w-full flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    isActiveRoute("/products") 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span>Products</span>
                </button>
              )}
              
              {currentUser?.permissions.orders && (
                <button
                  onClick={() => handleNavigation("/orders")}
                  className={`w-full flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    isActiveRoute("/orders") 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span>Orders</span>
                </button>
              )}
              
              {currentUser?.permissions.customers && (
                <button
                  onClick={() => handleNavigation("/customers")}
                  className={`w-full flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    isActiveRoute("/customers") 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span>Customers</span>
                </button>
              )}
              
              {currentUser?.permissions.reports && (
                <button
                  onClick={() => handleNavigation("/reports")}
                  className={`w-full flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    isActiveRoute("/reports") 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span>Reports</span>
                </button>
              )}
              
              {currentUser?.permissions.settings && (
                <button
                  onClick={() => handleNavigation("/settings")}
                  className={`w-full flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    isActiveRoute("/settings") 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span>Settings</span>
                </button>
              )}
              
              {currentUser?.permissions.users && (
                <button
                  onClick={() => handleNavigation("/users")}
                  className={`w-full flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    isActiveRoute("/users") 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span>Users</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search..." 
                  className="pl-8 h-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <BellRing className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser?.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {currentUser?.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {currentUser?.permissions.users && (
                    <DropdownMenuItem onClick={() => handleNavigation('/users')}>
                      <Users className="mr-2 h-4 w-4" />
                      <span>Manage Users</span>
                    </DropdownMenuItem>
                  )}
                  
                  {currentUser?.permissions.settings && (
                    <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  )}
                  
                  {currentUser?.permissions.orders && (
                    <DropdownMenuItem onClick={() => handleNavigation('/pos-shop')}>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>POS Shop</span>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
