
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-apGray-100">
      <div className="text-center max-w-lg mx-auto p-6 bg-white rounded-xl shadow-apple animate-fade-in">
        <h1 className="text-4xl font-bold mb-4 text-apGray-900">404</h1>
        <p className="text-xl text-apGray-700 mb-6">Page not found</p>
        <p className="text-apGray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="ap-button-primary">
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
