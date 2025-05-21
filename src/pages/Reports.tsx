
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { 
  Bar, 
  BarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';

const Reports: React.FC = () => {
  const { 
    hqStock, 
    items, 
    districts, 
    metrics,
    districtStock, 
    loanItems, 
    hqIssuanceVouchers, 
    hqItemMovements,
    hqLarVouchers 
  } = useData();
  
  // Report filters
  const [activeTab, setActiveTab] = useState('stock');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter items by search term
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get item name by ID
  const getItemName = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item ? `${item.name} (${item.code})` : 'Unknown Item';
  };
  
  // Get metric name by ID
  const getMetricName = (metricId: string) => {
    const metric = metrics.find(m => m.id === metricId);
    return metric ? metric.name : '';
  };
  
  // Get district name by ID
  const getDistrictName = (districtId: string) => {
    const district = districts.find(d => d.id === districtId);
    return district ? district.name : 'Unknown District';
  };
  
  // Filter HQ stock data for chart
  const stockChartData = filteredItems.map(item => {
    const stock = hqStock.find(s => s.itemId === item.id);
    return {
      name: item.name,
      quantity: stock ? stock.quantity : 0,
      metric: stock ? getMetricName(stock.metricId) : '',
    };
  }).filter(item => item.quantity > 0).slice(0, 10); // Top 10 items
  
  // District distribution data for pie chart
  const districtDistributionData = districts.map(district => {
    // Calculate total items distributed to this district
    const districtItems = districtStock.filter(ds => ds.districtId === district.id);
    const totalQuantity = districtItems.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      name: district.name,
      value: totalQuantity
    };
  }).filter(item => item.value > 0);
  
  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (e) {
      return 'Invalid Date';
    }
  };
  
  return (
    <AppLayout>
      <Card className="w-full">
        <CardHeader className="bg-apBlue-50">
          <CardTitle className="text-apBlue-700">Reports</CardTitle>
          <CardDescription>
            View and generate reports for inventory, issuances, and returns
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full">
              <TabsTrigger value="stock" className="flex-1">HQ Stock</TabsTrigger>
              <TabsTrigger value="district" className="flex-1">District Stock</TabsTrigger>
              <TabsTrigger value="loan" className="flex-1">Loan Items</TabsTrigger>
              <TabsTrigger value="issuance" className="flex-1">Issuance History</TabsTrigger>
              <TabsTrigger value="returns" className="flex-1">Return History</TabsTrigger>
            </TabsList>
            
            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search Item</Label>
                <div className="relative">
                  <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Item name or code"
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {(activeTab === 'district' || activeTab === 'issuance' || activeTab === 'returns') && (
                <div>
                  <Label htmlFor="district">District/Wing</Label>
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                    <SelectTrigger id="district">
                      <SelectValue placeholder="All Districts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Districts</SelectItem>
                      {districts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {(activeTab === 'issuance' || activeTab === 'returns' || activeTab === 'loan') && (
                <div>
                  <Label>Date Range</Label>
                  <DatePickerWithRange 
                    value={dateRange}
                    onChange={setDateRange} 
                  />
                </div>
              )}
            </div>
            
            {/* HQ Stock Tab */}
            <TabsContent value="stock" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">HQ Stock Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
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
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Stock List</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Item Code</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Low Stock Threshold</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map(item => {
                        const stock = hqStock.find(s => s.itemId === item.id);
                        const isLowStock = stock?.lowStockThreshold && stock.quantity <= stock.lowStockThreshold;
                        
                        return stock ? (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.code}</TableCell>
                            <TableCell>
                              {stock.quantity} {getMetricName(stock.metricId)}
                            </TableCell>
                            <TableCell>
                              {stock.lowStockThreshold ? `${stock.lowStockThreshold} ${getMetricName(stock.metricId)}` : 'Not Set'}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${isLowStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {isLowStock ? 'Low Stock' : 'Normal'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ) : null;
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* District Stock Tab */}
            <TabsContent value="district" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">District Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={districtDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {districtDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} items`, 'Quantity']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">District Stock Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>District/Wing</TableHead>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Returnable</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {districtStock
                        .filter(ds => !selectedDistrict || ds.districtId === selectedDistrict)
                        .filter(ds => {
                          const item = items.find(i => i.id === ds.itemId);
                          return item && (
                            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.code.toLowerCase().includes(searchTerm.toLowerCase())
                          );
                        })
                        .map(stock => (
                          <TableRow key={stock.id}>
                            <TableCell>{getDistrictName(stock.districtId)}</TableCell>
                            <TableCell>{getItemName(stock.itemId)}</TableCell>
                            <TableCell>
                              {stock.quantity} {getMetricName(stock.metricId)}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${stock.isReturnable ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                {stock.isReturnable ? 'Returnable' : 'Consumable'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Loan Items Tab */}
            <TabsContent value="loan" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Loan Items Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Expected Return Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loanItems
                        .filter(loan => {
                          // Filter by search term
                          const item = items.find(i => i.id === loan.itemId);
                          const matchesSearch = item && (
                            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.code.toLowerCase().includes(searchTerm.toLowerCase())
                          );
                          
                          // Filter by date range
                          let matchesDateRange = true;
                          if (dateRange?.from && dateRange?.to) {
                            const expectedReturnDate = new Date(loan.expectedReturnDate);
                            matchesDateRange = expectedReturnDate >= dateRange.from &&
                              expectedReturnDate <= dateRange.to;
                          }
                          
                          return matchesSearch && matchesDateRange;
                        })
                        .map(loan => {
                          const isOverdue = new Date(loan.expectedReturnDate) < new Date() && 
                                          loan.status === 'Loaned';
                          
                          return (
                            <TableRow key={loan.id}>
                              <TableCell>{getItemName(loan.itemId)}</TableCell>
                              <TableCell>
                                {loan.quantity} {getMetricName(loan.metricId)}
                              </TableCell>
                              <TableCell>{loan.sourceWing}</TableCell>
                              <TableCell>{loan.eventName}</TableCell>
                              <TableCell>{formatDate(loan.expectedReturnDate)}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  loan.status === 'Returned' 
                                    ? 'bg-green-100 text-green-700' 
                                    : isOverdue 
                                      ? 'bg-red-100 text-red-700' 
                                      : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {loan.status === 'Returned' 
                                    ? 'Returned' 
                                    : isOverdue 
                                      ? 'Overdue' 
                                      : 'On Loan'}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Issuance History Tab */}
            <TabsContent value="issuance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">HQ to District Issuance History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IV Number</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Returns</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hqIssuanceVouchers
                        .filter(iv => !selectedDistrict || iv.receivingDistrictId === selectedDistrict)
                        .filter(iv => {
                          if (!dateRange?.from || !dateRange?.to) return true;
                          const issueDate = new Date(iv.issueDate);
                          return issueDate >= dateRange.from && issueDate <= dateRange.to;
                        })
                        .map(iv => {
                          // Get all movements for this IV
                          const movements = hqItemMovements.filter(m => m.ivId === iv.id);
                          
                          // Check if any of the items match the search term
                          const matchesSearch = searchTerm
                            ? movements.some(m => {
                                const item = items.find(i => i.id === m.itemId);
                                return item && (
                                  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  item.code.toLowerCase().includes(searchTerm.toLowerCase())
                                );
                              })
                            : true;
                          
                          if (!matchesSearch) return null;
                          
                          // Calculate total items and returns
                          const totalItems = movements.length;
                          const totalReturned = movements.filter(m => m.returnedQuantity > 0).length;
                          
                          return (
                            <TableRow key={iv.id}>
                              <TableCell>{iv.ivNumber}</TableCell>
                              <TableCell>{formatDate(iv.issueDate)}</TableCell>
                              <TableCell>{getDistrictName(iv.receivingDistrictId)}</TableCell>
                              <TableCell>{totalItems} {totalItems === 1 ? 'item' : 'items'}</TableCell>
                              <TableCell>
                                {totalReturned > 0 ? (
                                  <span className="text-green-600">{totalReturned} returned</span>
                                ) : (
                                  <span className="text-gray-500">No returns</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Return History Tab */}
            <TabsContent value="returns" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">LAR History (District to HQ)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>LAR Number</TableHead>
                        <TableHead>Return Date</TableHead>
                        <TableHead>Original IV</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>Items Returned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hqLarVouchers
                        .filter(lar => {
                          // Get the original IV
                          const originalIV = hqIssuanceVouchers.find(iv => iv.id === lar.ivIdRef);
                          // Filter by district if selected
                          return !selectedDistrict || (originalIV && originalIV.receivingDistrictId === selectedDistrict);
                        })
                        .filter(lar => {
                          // Filter by date range
                          if (!dateRange?.from || !dateRange?.to) return true;
                          const returnDate = new Date(lar.returnDate);
                          return returnDate >= dateRange.from && returnDate <= dateRange.to;
                        })
                        .map(lar => {
                          // Get the original IV
                          const originalIV = hqIssuanceVouchers.find(iv => iv.id === lar.ivIdRef);
                          if (!originalIV) return null;
                          
                          // Get all movements for this LAR
                          const movements = hqItemMovements.filter(m => m.larId === lar.id);
                          
                          // Check if any of the items match the search term
                          const matchesSearch = searchTerm
                            ? movements.some(m => {
                                const item = items.find(i => i.id === m.itemId);
                                return item && (
                                  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  item.code.toLowerCase().includes(searchTerm.toLowerCase())
                                );
                              })
                            : true;
                          
                          if (!matchesSearch) return null;
                          
                          return (
                            <TableRow key={lar.id}>
                              <TableCell>{lar.larNumber}</TableCell>
                              <TableCell>{formatDate(lar.returnDate)}</TableCell>
                              <TableCell>{originalIV.ivNumber}</TableCell>
                              <TableCell>{getDistrictName(originalIV.receivingDistrictId)}</TableCell>
                              <TableCell>{movements.length} {movements.length === 1 ? 'item' : 'items'}</TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Reports;
