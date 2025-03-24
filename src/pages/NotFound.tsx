
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="animate-fade-in text-center">
        <FileQuestion className="mx-auto mb-4 h-24 w-24 text-muted-foreground opacity-20" />
        <h1 className="mb-2 text-4xl font-bold">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">
          Oops! We couldn't find this page
        </p>
        <Button asChild className="hover-lift transition-smooth">
          <a href="/">Return to Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
