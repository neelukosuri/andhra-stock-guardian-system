
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const Reports: React.FC = () => {
  const { 
    items,
    metrics,
    districts,
    hqStock,
    districtStock,
    hqIssuanceVouchers,
    hqItemMovements,
    hqLarVouchers,
    loanItems
  } = useData();
  
  const [activeTab, setActiveTab] = useState('hq-stock');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  // Helper functions to get names from IDs
  const getItemName = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.name : 'Unknown Item';
  };

  const getMetricName = (metricId: string) => {
    const metric = metrics.find(m => m.id === metricId);
    return metric ? metric.name : 'Unit';
  };

  const getDistrictName = (districtId: string) => {
    const district = districts.find(d => d.id === districtId);
    return district ? district.name : 'Unknown District';
  };

  // Generate HQ Stock Report
  const hqStockReport = hqStock.map(stock => {
    const item = items.find(i => i.id === stock.itemId);
    const metric = metrics.find(m => m.id === stock.metricId);
    
    return {
      itemCode: item?.code || 'Unknown',
      itemName: item?.name || 'Unknown',
      quantity: stock.quantity,
      metricName: metric?.name || 'Unit',
      lowStockThreshold: stock.lowStockThreshold || 'Not Set',
      status: stock.lowStockThreshold && stock.quantity <= stock.lowStockThreshold ? 'Low Stock' : 'Normal'
    };
  });

  // Generate District Stock Report
  const filteredDistrictStock = selectedDistrict ? 
    districtStock.filter(stock => stock.districtId === selectedDistrict) :
    districtStock;

  const districtStockReport = filteredDistrictStock.map(stock => {
    const item = items.find(i => i.id === stock.itemId);
    const metric = metrics.find(m => m.id === stock.metricId);
    const district = districts.find(d => d.id === stock.districtId);
    
    return {
      districtName: district?.name || 'Unknown',
      itemCode: item?.code || 'Unknown',
      itemName: item?.name || 'Unknown',
      quantity: stock.quantity,
      metricName: metric?.name || 'Unit',
      isReturnable: stock.isReturnable ? 'Yes (Ledger-I)' : 'No (Ledger-II)'
    };
  });

  // Generate Loan Items Report
  const loanItemsReport = loanItems.map(loan => {
    const item = items.find(i => i.id === loan.itemId);
    const metric = metrics.find(m => m.id === loan.metricId);
    
    return {
      itemName: item?.name || 'Unknown',
      sourceWing: loan.sourceWing,
      eventName: loan.eventName,
      quantity: loan.quantity,
      metricName: metric?.name || 'Unit',
      expectedReturnDate: new Date(loan.expectedReturnDate).toLocaleDateString(),
      actualReturnDate: loan.actualReturnDate ? new Date(loan.actualReturnDate).toLocaleDateString() : 'Not Returned',
      status: loan.status,
      overdueStatus: loan.status === 'Loaned' && new Date(loan.expectedReturnDate) < new Date() ? 'Overdue' : 'On Schedule'
    };
  });

  // Generate Issuance History Report
  const issuanceHistoryReport = hqIssuanceVouchers.map(voucher => {
    const district = districts.find(d => d.id === voucher.receivingDistrictId);
    
    // Get items issued with this voucher
    const movements = hqItemMovements.filter(m => m.ivId === voucher.id);
    
    // Count items and total quantity
    const itemCount = movements.length;
    const totalQuantity = movements.reduce((sum, m) => sum + m.quantity, 0);
    
    // Count returnable vs non-returnable
    const returnableCount = movements.filter(m => m.isReturnable).length;
    const nonReturnableCount = itemCount - returnableCount;
    
    return {
      ivNumber: voucher.ivNumber,
      issueDate: new Date(voucher.issueDate).toLocaleDateString(),
      district: district?.name || 'Unknown',
      itemCount,
      totalQuantity,
      returnableCount,
      nonReturnableCount
    };
  });

  // Filter by date range if set
  const filteredIssuanceHistory = dateRange?.from ? 
    issuanceHistoryReport.filter(iv => {
      const ivDate = new Date(iv.issueDate);
      if (dateRange.from && dateRange.to) {
        return ivDate >= dateRange.from && ivDate <= dateRange.to;
      } else if (dateRange.from) {
        return ivDate >= dateRange.from;
      }
      return true;
    }) : 
    issuanceHistoryReport;

  // Generate Return History Report
  const returnHistoryReport = hqLarVouchers.map(voucher => {
    // Get the original IV
    const originalIv = hqIssuanceVouchers.find(iv => iv.id === voucher.ivIdRef);
    const district = originalIv ? districts.find(d => d.id === originalIv.receivingDistrictId) : null;
    
    // Get items returned with this voucher
    const movements = hqItemMovements.filter(m => m.larId === voucher.id);
    
    // Count items and total quantity
    const itemCount = movements.length;
    const totalQuantity = movements.reduce((sum, m) => sum + m.quantity, 0);
    
    return {
      larNumber: voucher.larNumber,
      returnDate: new Date(voucher.returnDate).toLocaleDateString(),
      originalIvNumber: originalIv?.ivNumber || 'Unknown',
      district: district?.name || 'Unknown',
      itemCount,
      totalQuantity
    };
  });

  // Filter by date range if set
  const filteredReturnHistory = dateRange?.from ? 
    returnHistoryReport.filter(lar => {
      const larDate = new Date(lar.returnDate);
      if (dateRange.from && dateRange.to) {
        return larDate >= dateRange.from && larDate <= dateRange.to;
      } else if (dateRange.from) {
        return larDate >= dateRange.from;
      }
      return true;
    }) : 
    returnHistoryReport;

  // Prepare data for charts
  const hqStockChartData = items.slice(0, 10).map(item => {
    const stock = hqStock.find(s => s.itemId === item.id);
    return {
      name: item.name,
      quantity: stock?.quantity || 0
    };
  });

  const districtStockDistributionData = districts.map(district => {
    const distItems = districtStock.filter(s => s.districtId === district.id);
    const totalItems = distItems.length;
    const totalQuantity = distItems.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      name: district.name,
      items: totalItems,
      quantity: totalQuantity
    };
  });

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="bg-apBlue-50">
            <CardTitle className="text-apBlue-700">Reports</CardTitle>
            <CardDescription>
              View comprehensive reports and analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
                <TabsTrigger value="hq-stock">HQ Stock</TabsTrigger>
                <TabsTrigger value="district-stock">District Stock</TabsTrigger>
                <TabsTrigger value="loan-items">Loan Items</TabsTrigger>
                <TabsTrigger value="issuance-history">Issuance History</TabsTrigger>
                <TabsTrigger value="return-history">Return History</TabsTrigger>
              </TabsList>
              
              {/* HQ Stock Report */}
              <TabsContent value="hq-stock">
                <div className="space-y-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="lg:w-1/2">
                      <h3 className="text-lg font-medium mb-4">Current HQ Inventory</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item Code</TableHead>
                              <TableHead>Item Name</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Low Stock Threshold</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {hqStockReport.length > 0 ? (
                              hqStockReport.map((item, i) => (
                                <TableRow key={i}>
                                  <TableCell>{item.itemCode}</TableCell>
                                  <TableCell>{item.itemName}</TableCell>
                                  <TableCell>{item.quantity} {item.metricName}</TableCell>
                                  <TableCell>{item.lowStockThreshold}</TableCell>
                                  <TableCell>
                                    <span className={item.status === 'Low Stock' ? 'text-red-500 font-medium' : 'text-green-500'}>
                                      {item.status}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">No stock data available</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    
                    <div className="lg:w-1/2">
                      <h3 className="text-lg font-medium mb-4">Stock Distribution</h3>
                      <div className="h-[400px] bg-slate-50 p-4 rounded-lg">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={hqStockChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="quantity" fill="#0284c7" name="Quantity" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* District Stock Report */}
              <TabsContent value="district-stock">
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium">District Inventory</h3>
                    <div className="w-[250px]">
                      <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                        <SelectTrigger>
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
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>District</TableHead>
                            <TableHead>Item Code</TableHead>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Returnable</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {districtStockReport.length > 0 ? (
                            districtStockReport.map((item, i) => (
                              <TableRow key={i}>
                                <TableCell>{item.districtName}</TableCell>
                                <TableCell>{item.itemCode}</TableCell>
                                <TableCell>{item.itemName}</TableCell>
                                <TableCell>{item.quantity} {item.metricName}</TableCell>
                                <TableCell>{item.isReturnable}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-4">No district stock data available</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="h-[400px] bg-slate-50 p-4 rounded-lg">
                      <h3 className="text-base font-medium mb-4">District Stock Distribution</h3>
                      <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={districtStockDistributionData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="items" fill="#0369a1" name="Unique Items" />
                          <Bar dataKey="quantity" fill="#06b6d4" name="Total Quantity" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Loan Items Report */}
              <TabsContent value="loan-items">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium mb-4">Loan Items Status</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Source Wing</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Expected Return</TableHead>
                          <TableHead>Actual Return</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loanItemsReport.length > 0 ? (
                          loanItemsReport.map((item, i) => (
                            <TableRow key={i}>
                              <TableCell>{item.itemName}</TableCell>
                              <TableCell>{item.sourceWing}</TableCell>
                              <TableCell>{item.eventName}</TableCell>
                              <TableCell>{item.quantity} {item.metricName}</TableCell>
                              <TableCell>{item.expectedReturnDate}</TableCell>
                              <TableCell>{item.actualReturnDate}</TableCell>
                              <TableCell>
                                <span className={
                                  item.status === 'Returned' ? 'text-green-500 font-medium' : 
                                  item.overdueStatus === 'Overdue' ? 'text-red-500 font-medium' : 
                                  'text-amber-500 font-medium'
                                }>
                                  {item.status} {item.status === 'Loaned' && item.overdueStatus === 'Overdue' && '(Overdue)'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">No loan items data available</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs mr-2">Returned</span>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs mr-2">On Loan (On Schedule)</span>
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">On Loan (Overdue)</span>
                    </div>
                    <Button variant="outline">Export Report</Button>
                  </div>
                </div>
              </TabsContent>
              
              {/* Issuance History Report */}
              <TabsContent value="issuance-history">
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-medium">Issuance History</h3>
                    <div className="w-full md:w-auto">
                      <Label className="mb-2 block">Filter by date range</Label>
                      <DatePickerWithRange value={dateRange} onChange={setDateRange} className="w-[300px]" />
                    </div>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>IV Number</TableHead>
                          <TableHead>Issue Date</TableHead>
                          <TableHead>District/Wing</TableHead>
                          <TableHead>Items Count</TableHead>
                          <TableHead>Total Quantity</TableHead>
                          <TableHead>Returnable</TableHead>
                          <TableHead>Non-Returnable</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredIssuanceHistory.length > 0 ? (
                          filteredIssuanceHistory.map((iv, i) => (
                            <TableRow key={i}>
                              <TableCell>{iv.ivNumber}</TableCell>
                              <TableCell>{iv.issueDate}</TableCell>
                              <TableCell>{iv.district}</TableCell>
                              <TableCell>{iv.itemCount}</TableCell>
                              <TableCell>{iv.totalQuantity}</TableCell>
                              <TableCell>{iv.returnableCount}</TableCell>
                              <TableCell>{iv.nonReturnableCount}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">No issuance history available</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline">Export Report</Button>
                  </div>
                </div>
              </TabsContent>
              
              {/* Return History Report */}
              <TabsContent value="return-history">
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-medium">Return History</h3>
                    <div className="w-full md:w-auto">
                      <Label className="mb-2 block">Filter by date range</Label>
                      <DatePickerWithRange value={dateRange} onChange={setDateRange} className="w-[300px]" />
                    </div>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>LAR Number</TableHead>
                          <TableHead>Return Date</TableHead>
                          <TableHead>Original IV</TableHead>
                          <TableHead>District/Wing</TableHead>
                          <TableHead>Items Count</TableHead>
                          <TableHead>Total Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReturnHistory.length > 0 ? (
                          filteredReturnHistory.map((lar, i) => (
                            <TableRow key={i}>
                              <TableCell>{lar.larNumber}</TableCell>
                              <TableCell>{lar.returnDate}</TableCell>
                              <TableCell>{lar.originalIvNumber}</TableCell>
                              <TableCell>{lar.district}</TableCell>
                              <TableCell>{lar.itemCount}</TableCell>
                              <TableCell>{lar.totalQuantity}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">No return history available</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline">Export Report</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Reports;
