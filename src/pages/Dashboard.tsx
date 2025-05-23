
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/layout/AppLayout';
import { 
  Package, 
  PackageOpen, 
  ArchiveRestore,
  TrendingDown, 
  FileBarChart, 
  AlertTriangle,
} from 'lucide-react';
import { HQStockWithDetails } from '@/types';

interface DashboardProps {
  user: {
    id: string;
    username: string;
    role: 'HQ_ADMIN' | 'DISTRICT_ADMIN';
    districtId?: string;
  };
  onLogout?: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const { 
    items, 
    hqStock, 
    loanItems,
    districtStock,
    getItemById, 
    getMetricById,
    districts
  } = useData();

  const [stockWithDetails, setStockWithDetails] = useState<HQStockWithDetails[]>([]);
  const [lowStockItems, setLowStockItems] = useState<HQStockWithDetails[]>([]);
  const [districtName, setDistrictName] = useState<string>("");

  useEffect(() => {
    // For district admin, get district name
    if (user.role === 'DISTRICT_ADMIN' && user.districtId) {
      const district = districts.find(d => d.id === user.districtId);
      if (district) {
        setDistrictName(district.name);
      }
    }

    // HQ admin sees HQ stock data
    if (user.role === 'HQ_ADMIN') {
      // Enhance stock with item details
      const stockDetails = hqStock.map(stock => {
        const item = getItemById(stock.itemId);
        const metric = getMetricById(stock.metricId);
        
        return {
          ...stock,
          itemName: item?.name || 'Unknown Item',
          itemCode: item?.code || 'Unknown Code',
          metricName: metric?.name || 'Unknown Metric',
        };
      });
      
      setStockWithDetails(stockDetails);
      
      // Filter for low stock (less than 10 for demonstration)
      setLowStockItems(stockDetails.filter(stock => stock.quantity < 10));
    }
  }, [hqStock, getItemById, getMetricById, user, districts]);

  return (
    <AppLayout onLogout={onLogout}>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        
        {user.role === 'DISTRICT_ADMIN' && districtName && (
          <p className="text-apGray-600">Welcome to the {districtName} Dashboard.</p>
        )}
        
        {user.role === 'HQ_ADMIN' && (
          <p className="text-apGray-600">Welcome to the AP Police Communications Store Inventory System.</p>
        )}
      
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {/* Different cards for HQ and district admins */}
          {user.role === 'HQ_ADMIN' ? (
            <>
              {/* Total Items */}
              <Card className="ap-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Total Items</CardTitle>
                  <Package className="h-5 w-5 text-apBlue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{items.length}</div>
                  <p className="text-sm text-apGray-500 mt-1">Items in master catalog</p>
                </CardContent>
              </Card>
              
              {/* Current Stock */}
              <Card className="ap-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Current Stock</CardTitle>
                  <PackageOpen className="h-5 w-5 text-apBlue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{hqStock.length}</div>
                  <p className="text-sm text-apGray-500 mt-1">Items in HQ inventory</p>
                </CardContent>
              </Card>
              
              {/* Loan Items */}
              <Card className="ap-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Loan Items</CardTitle>
                  <ArchiveRestore className="h-5 w-5 text-apBlue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{loanItems.length}</div>
                  <p className="text-sm text-apGray-500 mt-1">Items on loan</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* District specific cards */}
              <Card className="ap-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Returnable Items</CardTitle>
                  <Package className="h-5 w-5 text-apBlue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {districtStock.filter(s => s.districtId === user.districtId && s.isReturnable).length}
                  </div>
                  <p className="text-sm text-apGray-500 mt-1">Ledger-I items in district inventory</p>
                </CardContent>
              </Card>
              
              <Card className="ap-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Consumable Items</CardTitle>
                  <PackageOpen className="h-5 w-5 text-apBlue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {districtStock.filter(s => s.districtId === user.districtId && !s.isReturnable).length}
                  </div>
                  <p className="text-sm text-apGray-500 mt-1">Ledger-II items in district inventory</p>
                </CardContent>
              </Card>
              
              <Card className="ap-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Internal Issues</CardTitle>
                  <TrendingDown className="h-5 w-5 text-apBlue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {/* Get number of internal issuances */}
                    {user.districtId ? districtStock.filter(s => s.districtId === user.districtId).length : 0}
                  </div>
                  <p className="text-sm text-apGray-500 mt-1">Items issued to offices</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        
        {/* HQ Admin - Low stock warning */}
        {user.role === 'HQ_ADMIN' && lowStockItems.length > 0 && (
          <Card className="ap-card border-amber-300 bg-amber-50">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <CardTitle className="text-lg font-medium text-amber-700">Low Stock Alert</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700 mb-2">The following items are running low on stock:</p>
              <ul className="space-y-1">
                {lowStockItems.map(item => (
                  <li key={item.id} className="text-sm">
                    <span className="font-medium">{item.itemCode}</span>: {item.itemName} - 
                    <span className="font-medium text-amber-800"> {item.quantity} {item.metricName}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        
        {/* Recent Activity & Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="ap-card">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest transactions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.role === 'HQ_ADMIN' ? (
                  <>
                    <div className="flex items-start space-x-4">
                      <TrendingDown className="h-5 w-5 text-apGray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Item Issued: Radio Sets</p>
                        <p className="text-sm text-apGray-500">Issued to Vijayawada Commissionerate - G12345</p>
                        <p className="text-xs text-apGray-400 mt-1">May 20, 2025 • 10:23 AM</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <FileBarChart className="h-5 w-5 text-apGray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Stock Updated: Batteries</p>
                        <p className="text-sm text-apGray-500">Added 50 units to inventory</p>
                        <p className="text-xs text-apGray-400 mt-1">May 19, 2025 • 02:37 PM</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-4">
                      <TrendingDown className="h-5 w-5 text-apGray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Items Received: Mobile Chargers</p>
                        <p className="text-sm text-apGray-500">Received from HQ - IV/20/05/2025/123</p>
                        <p className="text-xs text-apGray-400 mt-1">May 20, 2025 • 10:23 AM</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <TrendingDown className="h-5 w-5 text-apGray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Items Issued: Walkie Talkies</p>
                        <p className="text-sm text-apGray-500">Issued to Central Office - IV/19/05/2025/078</p>
                        <p className="text-xs text-apGray-400 mt-1">May 19, 2025 • 02:37 PM</p>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex items-start space-x-4">
                  <ArchiveRestore className="h-5 w-5 text-apGray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Item Returned: GPS Devices</p>
                    <p className="text-sm text-apGray-500">Returned from SIB Wing - LAR/20/05/2025/063</p>
                    <p className="text-xs text-apGray-400 mt-1">May 18, 2025 • 11:45 AM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="ap-card">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Frequently used actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {user.role === 'HQ_ADMIN' ? (
                  <>
                    <a href="/item-master" className="block p-3 rounded-lg bg-white border border-apGray-200 hover:bg-apGray-50 hover:border-apBlue-300 transition-colors">
                      <p className="font-medium">Add New Item</p>
                      <p className="text-sm text-apGray-500">Create a new item in the master catalog</p>
                    </a>
                    <a href="/stock-management" className="block p-3 rounded-lg bg-white border border-apGray-200 hover:bg-apGray-50 hover:border-apBlue-300 transition-colors">
                      <p className="font-medium">Update Stock</p>
                      <p className="text-sm text-apGray-500">Add or modify existing inventory</p>
                    </a>
                    <a href="/issue-to-districts" className="block p-3 rounded-lg bg-white border border-apGray-200 hover:bg-apGray-50 hover:border-apBlue-300 transition-colors">
                      <p className="font-medium">Issue to District</p>
                      <p className="text-sm text-apGray-500">Create a new issuance voucher</p>
                    </a>
                  </>
                ) : (
                  <>
                    <a href="/district-inventory" className="block p-3 rounded-lg bg-white border border-apGray-200 hover:bg-apGray-50 hover:border-apBlue-300 transition-colors">
                      <p className="font-medium">View Inventory</p>
                      <p className="text-sm text-apGray-500">Check current district inventory</p>
                    </a>
                    <a href="/issue-to-offices" className="block p-3 rounded-lg bg-white border border-apGray-200 hover:bg-apGray-50 hover:border-apBlue-300 transition-colors">
                      <p className="font-medium">Issue to Offices</p>
                      <p className="text-sm text-apGray-500">Create internal issuance voucher</p>
                    </a>
                    <a href="/district-reports" className="block p-3 rounded-lg bg-white border border-apGray-200 hover:bg-apGray-50 hover:border-apBlue-300 transition-colors">
                      <p className="font-medium">District Reports</p>
                      <p className="text-sm text-apGray-500">View district inventory reports</p>
                    </a>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
