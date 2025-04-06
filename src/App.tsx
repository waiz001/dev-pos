
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate, 
  useLocation 
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import POSSession from "./pages/POSSession";
import POSShop from "./pages/POSShop";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Create QueryClient outside of component to avoid recreation on re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ProtectedRoute component to handle authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();
  
  // Extract the route name from the path
  const routeName = location.pathname.split('/')[1] || 'dashboard';
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check permission for the route
  if (currentUser) {
    // Map route to permission key
    const permissionMap = {
      'products': 'products',
      'orders': 'orders',
      'customers': 'customers',
      'reports': 'reports',
      'settings': 'settings',
      'users': 'users',
      'pos-session': 'orders', // POS session needs orders permission
      'pos-shop': 'orders'     // POS shop also needs orders permission
    };
    
    const requiredPermission = permissionMap[routeName];
    
    // If the route requires a permission that the user doesn't have
    if (requiredPermission && !currentUser.permissions[requiredPermission]) {
      // Redirect to home page if they don't have permission
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

// Router component with AuthProvider
const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/products" 
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/customers" 
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/pos-session" 
            element={
              <ProtectedRoute>
                <POSSession />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/pos-shop" 
            element={
              <ProtectedRoute>
                <POSShop />
              </ProtectedRoute>
            } 
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <Sonner />
      </AuthProvider>
    </BrowserRouter>
  );
};

// Fix: Convert App to a proper functional component and wrap it correctly with the QueryClientProvider
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
