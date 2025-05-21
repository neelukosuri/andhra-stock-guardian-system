
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
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const DistrictReports: React.FC = () => {
  const { 
    items,
    metrics,
    districts,
    districtStock,
    districtIssuanceVouchers,
    districtItemMovements,
    districtLarVouchers
  } = useData();
  
  const [activeTab, setActiveTab] = useState('inventory');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // For demo purposes, use first district
  const districtId = 'district-1';
  const district = districts.find(d => d.id === districtId);
  const districtName = district?.name || 'Unknown District';
  
  // Helper functions to get names from IDs
  const getItemName = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.name : 'Unknown Item';
  };
  
  const getItemCode = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.code : 'Unknown';
  };

  const getMetricName = (metricId: string) => {
    const metric = metrics.find(m => m.id === metricId);
    return metric ? metric.name : 'Unit';
  };

  // Filter district stock for current district
  const currentDistrictStock = districtStock.filter(stock => stock.districtId === districtId);

  // Prepare inventory report data
  const inventoryReport = currentDistrictStock.map(stock => {
    const item = items.find(i => i.id === stock.itemId);
    const metric = metrics.find(m => m.id === stock.metricId);
    
    return {
      itemCode: item?.code || 'Unknown',
      itemName: item?.name || 'Unknown',
      quantity: stock.quantity,
      metricName: metric?.name || 'Unit',
      isReturnable: stock.isReturnable ? 'Yes (Ledger-I)' : 'No (Ledger-II)'
    };
  });

  // Split inventory into returnable and non-returnable
  const returnableItems = inventoryReport.filter(item => item.isReturnable === 'Yes (Ledger-I)');
  const nonReturnableItems = inventoryReport.filter(item => item.isReturnable === 'No (Ledger-II)');

  // Prepare issuance report data - internal office issuances
  const issuanceReport = districtIssuanceVouchers
    .filter(iv => {
      // Filter by date if range is provided
      if (dateRange?.from) {
        const ivDate = new Date(iv.issueDate);
        if (dateRange.from && dateRange.to) {
          return ivDate >= dateRange.from && ivDate <= dateRange.to;
        } else if (dateRange.from) {
          return ivDate >= dateRange.from;
        }
      }
      return true;
    })
    .map(iv => {
      // Get movements for this IV
      const movements = districtItemMovements.filter(m => m.districtIvId === iv.id);
      
      // Calculate totals
      const itemCount = movements.length;
      const totalQuantity = movements.reduce((sum, m) => sum + m.quantity, 0);
      
      return {
        ivNumber: iv.ivNumber,
        issueDate: new Date(iv.issueDate).toLocaleDateString(),
        receivingOffice: iv.receivingOfficeName,
        itemCount,
        totalQuantity
      };
    });

  // Prepare returns report data - internal office returns
  const returnsReport = districtLarVouchers
    .filter(lar => {
      // Filter by date if range is provided
      if (dateRange?.from) {
        const larDate = new Date(lar.returnDate);
        if (dateRange.from && dateRange.to) {
          return larDate >= dateRange.from && larDate <= dateRange.to;
        } else if (dateRange.from) {
          return larDate >= dateRange.from;
        }
      }
      return true;
    })
    .map(lar => {
      // Get the original IV
      const originalIv = districtIssuanceVouchers.find(iv => iv.id === lar.districtIvIdRef);
      
      // Get movements for this LAR
      const movements = districtItemMovements.filter(m => m.districtLarId === lar.id);
      
      // Calculate totals
      const itemCount = movements.length;
      const totalQuantity = movements.reduce((sum, m) => sum + m.quantity, 0);
      
      return {
        larNumber: lar.larNumber,
        returnDate: new Date(lar.returnDate).toLocaleDateString(),
        originalIvNumber: originalIv?.ivNumber || 'Unknown',
        receivingOffice: originalIv?.receivingOfficeName || 'Unknown',
        itemCount,
        totalQuantity
      };
    });

  // Prepare data for charts
  const inventoryDistributionData = [
    { name: 'Returnable', value: returnableItems.length, color: '#0369a1' },
    { name: 'Non-Returnable', value: nonReturnableItems.length, color: '#06b6d4' }
  ];

  const topItemsChartData = inventoryReport
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map(item => ({
      name: item.itemName,
      quantity: item.quantity
    }));

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="bg-apBlue-50">
            <CardTitle className="text-apBlue-700">District Reports - {districtName}</CardTitle>
            <CardDescription>
              View district-specific reports and analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-6">
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="issuance">Issuance to Offices</TabsTrigger>
                <TabsTrigger value="returns">Returns from Offices</TabsTrigger>
              </TabsList>
              
              {/* Inventory Report */}
              <TabsContent value="inventory">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 border rounded-lg p-5">
                      <h3 className="text-lg font-medium mb-4">District Inventory Overview</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item Code</TableHead>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Classification</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inventoryReport.length > 0 ? (
                            inventoryReport.map((item, i) => (
                              <TableRow key={i}>
                                <TableCell>{item.itemCode}</TableCell>
                                <TableCell>{item.itemName}</TableCell>
                                <TableCell>{item.quantity} {item.metricName}</TableCell>
                                <TableCell>{item.isReturnable}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-4">No inventory data available</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="lg:col-span-1 bg-slate-50 rounded-lg p-5">
                      <h3 className="text-base font-medium mb-4">Inventory Distribution</h3>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={inventoryDistributionData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={60}
                              fill="#8884d8"
                              label
                            >
                              {inventoryDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <h3 className="text-base font-medium my-4">Top Items by Quantity</h3>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topItemsChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="quantity" fill="#0284c7" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-5">
                      <h3 className="text-lg font-medium mb-4">Returnable Items (Ledger-I)</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Quantity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {returnableItems.length > 0 ? (
                            returnableItems.map((item, i) => (
                              <TableRow key={i}>
                                <TableCell>{item.itemName}</TableCell>
                                <TableCell>{item.quantity} {item.metricName}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center py-4">No returnable items</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="border rounded-lg p-5">
                      <h3 className="text-lg font-medium mb-4">Non-Returnable Items (Ledger-II)</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Quantity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {nonReturnableItems.length > 0 ? (
                            nonReturnableItems.map((item, i) => (
                              <TableRow key={i}>
                                <TableCell>{item.itemName}</TableCell>
                                <TableCell>{item.quantity} {item.metricName}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center py-4">No non-returnable items</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline">Export Inventory Report</Button>
                  </div>
                </div>
              </TabsContent>
              
              {/* Issuance Report */}
              <TabsContent value="issuance">
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-medium">Issuance to Internal Offices</h3>
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
                          <TableHead>Receiving Office</TableHead>
                          <TableHead>Items Count</TableHead>
                          <TableHead>Total Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {issuanceReport.length > 0 ? (
                          issuanceReport.map((iv, i) => (
                            <TableRow key={i}>
                              <TableCell>{iv.ivNumber}</TableCell>
                              <TableCell>{iv.issueDate}</TableCell>
                              <TableCell>{iv.receivingOffice}</TableCell>
                              <TableCell>{iv.itemCount}</TableCell>
                              <TableCell>{iv.totalQuantity}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">No issuance data available</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline">Export Issuance Report</Button>
                  </div>
                </div>
              </TabsContent>
              
              {/* Returns Report */}
              <TabsContent value="returns">
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-medium">Returns from Internal Offices</h3>
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
                          <TableHead>Office</TableHead>
                          <TableHead>Items Count</TableHead>
                          <TableHead>Total Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {returnsReport.length > 0 ? (
                          returnsReport.map((lar, i) => (
                            <TableRow key={i}>
                              <TableCell>{lar.larNumber}</TableCell>
                              <TableCell>{lar.returnDate}</TableCell>
                              <TableCell>{lar.originalIvNumber}</TableCell>
                              <TableCell>{lar.receivingOffice}</TableCell>
                              <TableCell>{lar.itemCount}</TableCell>
                              <TableCell>{lar.totalQuantity}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">No returns data available</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="outline">Export Returns Report</Button>
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

export default DistrictReports;
