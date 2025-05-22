
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/layout/AppLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertTriangleIcon, 
  PackageIcon, 
  ClipboardListIcon, 
  TruckIcon, 
  MailIcon, 
  UsersIcon,
  ArrowRightIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { 
    items, 
    hqStock, 
    loanItems, 
    districts, 
    districtStock, 
    hqIssuanceVouchers,
    hqLarVouchers,
    getItemById,
    getMetricById 
  } = useData();

  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  useEffect(() => {
    // Find low stock items (for demo, items with quantity < 5)
    const low = hqStock
      .filter(stock => stock.quantity < 5)
      .map(stock => {
        const item = getItemById(stock.itemId);
        const metric = getMetricById(stock.metricId);
        return {
          ...stock,
          itemName: item?.name || 'Unknown',
          itemCode: item?.code || 'Unknown',
          metricName: metric?.name || 'Units'
        };
      });
    
    setLowStockItems(low);
    
    // Get recent transactions (issuances and returns, sorted by date)
    const issuances = hqIssuanceVouchers.slice(0, 5).map(iv => ({
      ...iv,
      type: 'Issuance',
      date: new Date(iv.createdAt),
      referenceNumber: iv.ivNumber
    }));
    
    const returns = hqLarVouchers.slice(0, 5).map(lar => ({
      ...lar,
      type: 'Return',
      date: new Date(lar.returnDate),
      referenceNumber: lar.larNumber
    }));
    
    // Combine and sort by date (most recent first)
    const combined = [...issuances, ...returns].sort((a, b) => 
      b.date.getTime() - a.date.getTime()
    ).slice(0, 5);
    
    setRecentTransactions(combined);
  }, [hqStock, hqIssuanceVouchers, hqLarVouchers]);
  
  // Calculate summary statistics
  const totalItems = items.length;
  const totalStockItems = hqStock.reduce((sum, item) => sum + item.quantity, 0);
  const totalLoanItems = loanItems.filter(item => item.status === 'Loaned').length;
  const totalDistricts = districts.length;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-apGray-600 mt-1">AP Police Communications Store Inventory System</p>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex flex-row items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <h3 className="text-2xl font-bold">{totalItems}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <PackageIcon className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-row items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Stock Count</p>
                <h3 className="text-2xl font-bold">{totalStockItems}</h3>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <ClipboardListIcon className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-row items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Loan Items</p>
                <h3 className="text-2xl font-bold">{totalLoanItems}</h3>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <TruckIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-row items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Districts</p>
                <h3 className="text-2xl font-bold">{totalDistricts}</h3>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="bg-red-50">
            <div className="flex items-center space-x-2">
              <AlertTriangleIcon className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-700">Low Stock Alerts</CardTitle>
            </div>
            <CardDescription>Items that need to be restocked soon</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Metric</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                      No low stock items at the moment.
                    </TableCell>
                  </TableRow>
                ) : (
                  lowStockItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.itemCode}</TableCell>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell className="text-red-500 font-semibold">{item.quantity}</TableCell>
                      <TableCell>{item.metricName}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MailIcon className="h-5 w-5 text-blue-500" />
              <CardTitle>Recent Transactions</CardTitle>
            </div>
            <CardDescription>Latest issuances and returns</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference #</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                      No recent transactions.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentTransactions.map((transaction) => (
                    <TableRow key={transaction.referenceNumber}>
                      <TableCell>{transaction.date.toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{transaction.referenceNumber}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'Issuance' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Quick Access */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/item-master">
              <Card className="hover:border-primary transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-lg">Item Master</h3>
                      <p className="text-sm text-gray-500">Manage inventory items and ledgers</p>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/stock-management">
              <Card className="hover:border-primary transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-lg">Stock Management</h3>
                      <p className="text-sm text-gray-500">Manage HQ inventory and stock</p>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/loan-items">
              <Card className="hover:border-primary transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-lg">Loan Items</h3>
                      <p className="text-sm text-gray-500">Track items received on loan</p>
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
