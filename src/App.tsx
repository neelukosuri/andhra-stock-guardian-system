
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { DataProvider } from '@/contexts/DataContext';

// Import all pages
import Index from '@/pages/Index';
import ItemMaster from '@/pages/ItemMaster';
import StockManagement from '@/pages/StockManagement';
import LoanItems from '@/pages/LoanItems';
import LoanItemsReturn from '@/pages/LoanItemsReturn';
import IssueToDistricts from '@/pages/IssueToDistricts';
import LarFromDistricts from '@/pages/LarFromDistricts';
import IssueToOffices from '@/pages/IssueToOffices';
import LarFromOffices from '@/pages/LarFromOffices';
import DistrictInventory from '@/pages/DistrictInventory';
import DistrictReports from '@/pages/DistrictReports';
import Reports from '@/pages/Reports';
import UserManagement from '@/pages/UserManagement';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ap-police-theme">
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/item-master" element={<ItemMaster />} />
            <Route path="/stock-management" element={<StockManagement />} />
            <Route path="/loan-items" element={<LoanItems />} />
            <Route path="/loan-items-return" element={<LoanItemsReturn />} />
            <Route path="/issue-to-districts" element={<IssueToDistricts />} />
            <Route path="/lar-from-districts" element={<LarFromDistricts />} />
            <Route path="/issue-to-offices" element={<IssueToOffices />} />
            <Route path="/lar-from-offices" element={<LarFromOffices />} />
            <Route path="/district-inventory" element={<DistrictInventory />} />
            <Route path="/district-reports" element={<DistrictReports />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
