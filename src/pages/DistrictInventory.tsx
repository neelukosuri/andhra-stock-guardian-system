
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { 
  Bar, 
  BarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';

const DistrictInventory: React.FC = () => {
  const { districtStock, items, metrics, userRole } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // For demo purposes, we'll assume we're looking at the first district's data
  // In a real app, this would come from the current user's district ID
  const districtId = userRole === 'HQ_ADMIN' ? null : 'district-1';
  
  // Filter district stock by the current district
  const filteredStock = districtStock.filter(stock => 
    !districtId || stock.districtId === districtId
  );
  
  // Filter by search term
  const searchFilteredStock = filteredStock.filter(stock => {
    const item = items.find(i => i.id === stock.itemId);
    return !searchTerm || (
      item && (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });
  
  // Further filter by returnable/consumable based on active tab
  const tabFilteredStock = searchFilteredStock.filter(stock => {
    if (activeTab === 'all') return true;
    if (activeTab === 'returnable') return stock.isReturnable;
    if (activeTab === 'consumable') return !stock.isReturnable;
    return true;
  });
  
  // Get item name by ID
  const getItemName = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.name : 'Unknown Item';
  };
  
  // Get item code by ID
  const getItemCode = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.code : '';
  };
  
  // Get metric name by ID
  const getMetricName = (metricId: string) => {
    const metric = metrics.find(m => m.id === metricId);
    return metric ? metric.name : '';
  };
  
  // Prepare chart data for visualization
  const stockChartData = tabFilteredStock.slice(0, 10).map(stock => {
    const item = items.find(i => i.id === stock.itemId);
    return {
      name: item ? item.name : 'Unknown',
      quantity: stock.quantity,
      metric: getMetricName(stock.metricId),
      type: stock.isReturnable ? 'Returnable' : 'Consumable'
    };
  });
  
  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <Card className="w-full">
          <CardHeader className="bg-apBlue-50">
            <CardTitle className="text-apBlue-700">District Inventory</CardTitle>
            <CardDescription>
              View and manage inventory items assigned to your district
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by item name or code"
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            
              {/* Tabs for filtering */}
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full md:w-auto">
                  <TabsTrigger value="all">All Items</TabsTrigger>
                  <TabsTrigger value="returnable">Ledger-I (Returnable)</TabsTrigger>
                  <TabsTrigger value="consumable">Ledger-II (Consumable)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Inventory Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={stockChartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              angle={-45} 
                              textAnchor="end" 
                              height={80} 
                            />
                            <YAxis />
                            <Tooltip 
                              formatter={(value, name, props) => [`${value} ${props.payload.metric}`, 'Quantity']} 
                            />
                            <Legend />
                            <Bar dataKey="quantity" name="Quantity" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Item Code</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Ledger</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tabFilteredStock.map(stock => (
                        <TableRow key={stock.id}>
                          <TableCell>{getItemName(stock.itemId)}</TableCell>
                          <TableCell>{getItemCode(stock.itemId)}</TableCell>
                          <TableCell>
                            {stock.quantity} {getMetricName(stock.metricId)}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              stock.isReturnable ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {stock.isReturnable ? 'Ledger-I (Returnable)' : 'Ledger-II (Consumable)'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {tabFilteredStock.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No inventory items found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="returnable">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Item Code</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tabFilteredStock.map(stock => (
                        <TableRow key={stock.id}>
                          <TableCell>{getItemName(stock.itemId)}</TableCell>
                          <TableCell>{getItemCode(stock.itemId)}</TableCell>
                          <TableCell>
                            {stock.quantity} {getMetricName(stock.metricId)}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              Returnable
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {tabFilteredStock.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No returnable items found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="consumable">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Item Code</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tabFilteredStock.map(stock => (
                        <TableRow key={stock.id}>
                          <TableCell>{getItemName(stock.itemId)}</TableCell>
                          <TableCell>{getItemCode(stock.itemId)}</TableCell>
                          <TableCell>
                            {stock.quantity} {getMetricName(stock.metricId)}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              Consumable
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {tabFilteredStock.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No consumable items found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DistrictInventory;
