
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import {
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip
} from 'recharts';

const DistrictReports: React.FC = () => {
  const { 
    districtStock, 
    items, 
    metrics,
    districtIssuanceVouchers, 
    districtItemMovements,
    staff
  } = useData();
  
  // For demo purposes, we'll use the first district
  const districtId = 'district-1';
  
  // Report filters
  const [activeTab, setActiveTab] = useState('stock');
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
    return item ? `${item.name}` : 'Unknown Item';
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
  
  // Get staff name by G-Number
  const getStaffName = (gNo: string) => {
    const staffMember = staff.find(s => s.gNo === gNo);
    return staffMember ? staffMember.name : 'Unknown Staff';
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (e) {
      return 'Invalid Date';
    }
  };
  
  // Filter district stock for this district
  const currentDistrictStock = districtStock.filter(stock => 
    stock.districtId === districtId
  );
  
  // Prepare data for returnable/consumable pie chart
  const stockTypesData = [
    { 
      name: 'Returnable Items', 
      value: currentDistrictStock.filter(stock => stock.isReturnable).length
    },
    { 
      name: 'Consumable Items', 
      value: currentDistrictStock.filter(stock => !stock.isReturnable).length
    }
  ];
  
  // Calculate office distribution
  const officeDistribution = districtIssuanceVouchers
    .reduce((acc, iv) => {
      const office = iv.receivingOfficeName;
      if (!acc[office]) {
        acc[office] = 0;
      }
      
      // Count items issued to this office
      const itemsIssued = districtItemMovements.filter(m => 
        m.districtIvId === iv.id
      ).length;
      
      acc[office] += itemsIssued;
      return acc;
    }, {} as Record<string, number>);
  
  const officeDistributionData = Object.entries(officeDistribution).map(([name, value]) => ({
    name,
    value
  }));
  
  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  return (
    <AppLayout>
      <Card className="w-full">
        <CardHeader className="bg-apBlue-50">
          <CardTitle className="text-apBlue-700">District Reports</CardTitle>
          <CardDescription>
            View reports and analytics specific to your district inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full">
              <TabsTrigger value="stock" className="flex-1">Stock Overview</TabsTrigger>
              <TabsTrigger value="issuance" className="flex-1">Issuance History</TabsTrigger>
              <TabsTrigger value="returns" className="flex-1">Return History</TabsTrigger>
            </TabsList>
            
            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="text-sm font-medium">Search Item</label>
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
              
              {(activeTab === 'issuance' || activeTab === 'returns') && (
                <div>
                  <label className="text-sm font-medium">Date Range</label>
                  <DatePickerWithRange 
                    value={dateRange}
                    onChange={setDateRange} 
                  />
                </div>
              )}
            </div>
            
            {/* Stock Overview Tab */}
            <TabsContent value="stock" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Item Types Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stockTypesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {stockTypesData.map((entry, index) => (
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
                    <CardTitle className="text-lg">Office Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={officeDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {officeDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} items`, 'Quantity']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Stock Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Item Code</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentDistrictStock.filter(stock => {
                        const item = items.find(i => i.id === stock.itemId);
                        return !searchTerm || (
                          item && (
                            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.code.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                        );
                      }).map(stock => (
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
                              {stock.isReturnable ? 'Returnable' : 'Consumable'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {currentDistrictStock.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No stock items found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Issuance History Tab */}
            <TabsContent value="issuance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">District to Office Issuance History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IV Number</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Receiving Office</TableHead>
                        <TableHead>Receiving Staff</TableHead>
                        <TableHead>Items</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {districtIssuanceVouchers
                        .filter(iv => {
                          if (!dateRange?.from || !dateRange?.to) return true;
                          const issueDate = new Date(iv.issueDate);
                          return issueDate >= dateRange.from && issueDate <= dateRange.to;
                        })
                        .map(iv => {
                          // Get all movements for this IV
                          const movements = districtItemMovements.filter(m => m.districtIvId === iv.id);
                          
                          // Check if any items match search term
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
                            <TableRow key={iv.id}>
                              <TableCell>{iv.ivNumber}</TableCell>
                              <TableCell>{formatDate(iv.issueDate)}</TableCell>
                              <TableCell>{iv.receivingOfficeName}</TableCell>
                              <TableCell>{getStaffName(iv.receivingStaffGNo)}</TableCell>
                              <TableCell>{movements.length} items</TableCell>
                            </TableRow>
                          );
                        })}
                      
                      {districtIssuanceVouchers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            No issuance history found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Issuance Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IV Number</TableHead>
                        <TableHead>Office</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Returned</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {districtItemMovements
                        .filter(m => m.movementType === 'Issue_To_Internal')
                        .filter(m => {
                          // Filter by search term
                          const item = items.find(i => i.id === m.itemId);
                          return !searchTerm || (
                            item && (
                              item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              item.code.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                          );
                        })
                        .filter(m => {
                          if (!dateRange?.from || !dateRange?.to) return true;
                          
                          // Get IV for date filtering
                          const iv = m.districtIvId
                            ? districtIssuanceVouchers.find(iv => iv.id === m.districtIvId)
                            : null;
                            
                          if (!iv) return true;
                          const issueDate = new Date(iv.issueDate);
                          return issueDate >= dateRange.from && issueDate <= dateRange.to;
                        })
                        .map(movement => {
                          const iv = movement.districtIvId
                            ? districtIssuanceVouchers.find(iv => iv.id === movement.districtIvId)
                            : null;
                            
                          return (
                            <TableRow key={movement.id}>
                              <TableCell>{iv ? iv.ivNumber : 'N/A'}</TableCell>
                              <TableCell>{iv ? iv.receivingOfficeName : 'N/A'}</TableCell>
                              <TableCell>
                                {getItemName(movement.itemId)} ({getItemCode(movement.itemId)})
                              </TableCell>
                              <TableCell>
                                {movement.quantity} {getMetricName(movement.metricId)}
                              </TableCell>
                              <TableCell>
                                {movement.returnedQuantity} {getMetricName(movement.metricId)}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  movement.isReturnable ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                }`}>
                                  {movement.isReturnable ? 'Returnable' : 'Consumable'}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      
                      {districtItemMovements.filter(m => m.movementType === 'Issue_To_Internal').length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            No issuance items found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Return History Tab */}
            <TabsContent value="returns" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Returns from Offices (LAR)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>LAR Number</TableHead>
                        <TableHead>Return Date</TableHead>
                        <TableHead>Original IV</TableHead>
                        <TableHead>Office</TableHead>
                        <TableHead>Items Returned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No return history found
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Returns</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IV Number</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Office</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Pending Return</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {districtItemMovements
                        .filter(m => 
                          m.movementType === 'Issue_To_Internal' && 
                          m.isReturnable && 
                          m.quantity > m.returnedQuantity
                        )
                        .filter(m => {
                          // Filter by search term
                          const item = items.find(i => i.id === m.itemId);
                          return !searchTerm || (
                            item && (
                              item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              item.code.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                          );
                        })
                        .map(movement => {
                          const iv = movement.districtIvId
                            ? districtIssuanceVouchers.find(iv => iv.id === movement.districtIvId)
                            : null;
                            
                          const pendingReturn = movement.quantity - movement.returnedQuantity;
                          
                          return (
                            <TableRow key={movement.id}>
                              <TableCell>{iv ? iv.ivNumber : 'N/A'}</TableCell>
                              <TableCell>{iv ? formatDate(iv.issueDate) : 'N/A'}</TableCell>
                              <TableCell>{iv ? iv.receivingOfficeName : 'N/A'}</TableCell>
                              <TableCell>
                                {getItemName(movement.itemId)} ({getItemCode(movement.itemId)})
                              </TableCell>
                              <TableCell>
                                {movement.quantity} {getMetricName(movement.metricId)}
                              </TableCell>
                              <TableCell>
                                <span className="font-medium text-amber-600">
                                  {pendingReturn} {getMetricName(movement.metricId)} pending
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      
                      {districtItemMovements.filter(m => 
                        m.movementType === 'Issue_To_Internal' && 
                        m.isReturnable && 
                        m.quantity > m.returnedQuantity
                      ).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            No pending returns found
                          </TableCell>
                        </TableRow>
                      )}
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

export default DistrictReports;
