
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ItemMaster from "./pages/ItemMaster";
import StockManagement from "./pages/StockManagement";
import LoanItems from "./pages/LoanItems";
import IssueToDistricts from "./pages/IssueToDistricts";
import LarFromDistricts from "./pages/LarFromDistricts";
import UserManagement from "./pages/UserManagement";
import Reports from "./pages/Reports";
import DistrictInventory from "./pages/DistrictInventory";
import IssueToOffices from "./pages/IssueToOffices";
import LarFromOffices from "./pages/LarFromOffices";
import DistrictReports from "./pages/DistrictReports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/item-master" element={<ItemMaster />} />
            <Route path="/stock-management" element={<StockManagement />} />
            <Route path="/loan-items" element={<LoanItems />} />
            <Route path="/issue-to-districts" element={<IssueToDistricts />} />
            <Route path="/lar-from-districts" element={<LarFromDistricts />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/reports" element={<Reports />} />
            
            {/* District Routes */}
            <Route path="/district-inventory" element={<DistrictInventory />} />
            <Route path="/issue-to-offices" element={<IssueToOffices />} />
            <Route path="/lar-from-offices" element={<LarFromOffices />} />
            <Route path="/district-reports" element={<DistrictReports />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
