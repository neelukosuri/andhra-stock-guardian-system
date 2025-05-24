
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { DataProvider } from '@/contexts/DataContext';
import { useState, useEffect } from 'react';

// Import all pages
import Login from '@/pages/Login';
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
import Alerts from '@/pages/Alerts';
import UserManagement from '@/pages/UserManagement';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

// Auth type for session management
type AuthUser = {
  id: string;
  username: string;
  role: 'HQ_ADMIN' | 'DISTRICT_ADMIN';
  districtId?: string;
};

function App() {
  // State to track authentication
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  
  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      try {
        setAuthUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  // Login handler - will be passed to Login component
  const handleLogin = (user: AuthUser) => {
    setAuthUser(user);
    localStorage.setItem('authUser', JSON.stringify(user));
  };

  // Logout handler
  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem('authUser');
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="ap-police-theme">
      <DataProvider>
        <Router>
          <Routes>
            {/* Public route - Login */}
            <Route path="/" element={
              authUser ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
            } />
            
            {/* Protected routes - Redirect to login if not authenticated */}
            <Route path="/dashboard" element={
              authUser ? <Dashboard user={authUser} onLogout={handleLogout} /> : <Navigate to="/" replace />
            } />
            
            <Route path="/item-master" element={
              authUser ? <ItemMaster /> : <Navigate to="/" replace />
            } />
            <Route path="/stock-management" element={
              authUser ? <StockManagement /> : <Navigate to="/" replace />
            } />
            <Route path="/loan-items" element={
              authUser ? <LoanItems /> : <Navigate to="/" replace />
            } />
            <Route path="/loan-items-return" element={
              authUser ? <LoanItemsReturn /> : <Navigate to="/" replace />
            } />
            <Route path="/issue-to-districts" element={
              authUser?.role === 'HQ_ADMIN' ? <IssueToDistricts /> : <Navigate to="/" replace />
            } />
            <Route path="/lar-from-districts" element={
              authUser?.role === 'HQ_ADMIN' ? <LarFromDistricts /> : <Navigate to="/" replace />
            } />
            <Route path="/issue-to-offices" element={
              authUser ? <IssueToOffices /> : <Navigate to="/" replace />
            } />
            <Route path="/lar-from-offices" element={
              authUser ? <LarFromOffices /> : <Navigate to="/" replace />
            } />
            <Route path="/district-inventory" element={
              authUser ? <DistrictInventory user={authUser} /> : <Navigate to="/" replace />
            } />
            <Route path="/district-reports" element={
              authUser ? <DistrictReports /> : <Navigate to="/" replace />
            } />
            <Route path="/reports" element={
              authUser?.role === 'HQ_ADMIN' ? <Reports /> : <Navigate to="/" replace />
            } />
            <Route path="/alerts" element={
              authUser ? <Alerts /> : <Navigate to="/" replace />
            } />
            <Route path="/user-management" element={
              authUser?.role === 'HQ_ADMIN' ? <UserManagement /> : <Navigate to="/" replace />
            } />
            <Route path="/settings" element={
              authUser ? <Settings user={authUser} onLogout={handleLogout} /> : <Navigate to="/" replace />
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
