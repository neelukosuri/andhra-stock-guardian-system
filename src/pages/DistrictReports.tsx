import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useData } from '@/contexts/DataContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DistrictReports = () => {
  const { 
    items, 
    metrics, 
    districtIssuanceVouchers,
    districtLarVouchers,
    districtItemMovements,
    districtStock,
  } = useData();
  
  const [reportType, setReportType] = useState('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  // In a real app, this would come from user context or props
  const districtId = 'district-1';
  
  // Helper to get metric name
  const getMetricName = (metricId: string) => {
    const metric = metrics.find(m => m.id === metricId);
    return metric ? metric.name : '';
  };
  
  // Helper to get item name
  const getItemName = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.name : 'Unknown Item';
  };
  
  // Helper to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Filter district stock for this district
  const districtStockData = districtStock
    .filter(stock => stock.districtId === districtId)
    .map(stock => {
      const item = items.find(i => i.id === stock.itemId);
      return {
        ...stock,
        itemName: item?.name || 'Unknown Item',
        itemCode: item?.code || 'N/A', // Use code instead of itemCode
        metricName: getMetricName(stock.metricId)
      };
    })
    .filter(stock => 
      stock.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  // Separate returnable and consumable items
  const returnableItems = districtStockData.filter(stock => stock.isReturnable);
  const consumableItems = districtStockData.filter(stock => !stock.isReturnable);
  
  // Generate issuance report data for this district
  const issuanceReportData = districtIssuanceVouchers
    .filter(iv => iv.districtId === districtId) // Ensure districtId is checked
    .map(iv => {
      const movementsForIV = districtItemMovements.filter(m => m.districtIvId === iv.id);
      const totalItems = movementsForIV.length;
      
      return {
        ...iv,
        officeName: iv.receivingOfficeName,
        totalItems,
        issuedDate: new Date(iv.issueDate)
      };
    })
    .filter(iv => {
      // Filter by search query
      if (searchQuery && !iv.officeName.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !iv.ivNumber.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by date range
      if (dateRange?.from && dateRange?.to) {
        return iv.issuedDate >= dateRange.from && iv.issuedDate <= dateRange.to;
      } else if (dateRange?.from) {
        return iv.issuedDate >= dateRange.from;
      }
      
      return true;
    });
  
  // Generate return (LAR) report data for this district
  const larReportData = districtLarVouchers
    .filter(lar => {
      // Find the related IV to check if it belongs to this district
      const iv = districtIssuanceVouchers.find(i => i.id === lar.districtIvIdRef);
      return iv && iv.districtId === districtId; // Ensure districtId is checked
    })
    .map(lar => {
      const iv = districtIssuanceVouchers.find(i => i.id === lar.districtIvIdRef);
      const movementsForLAR = districtItemMovements.filter(m => m.districtLarId === lar.id);
      const totalItems = movementsForLAR.length;
      
      return {
        ...lar,
        officeName: iv?.receivingOfficeName || 'Unknown Office',
        ivNumber: iv?.ivNumber || 'Unknown',
        totalItems,
        returnedDate: new Date(lar.returnDate)
      };
    })
    .filter(lar => {
      // Filter by search query
      if (searchQuery && !lar.officeName.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !lar.larNumber.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by date range
      if (dateRange?.from && dateRange?.to) {
        return lar.returnedDate >= dateRange.from && lar.returnedDate <= dateRange.to;
      } else if (dateRange?.from) {
        return lar.returnedDate >= dateRange.from;
      }
      
      return true;
    });
  
  // Generate data for charts
  const stockChartData = items
    .filter(item => districtStockData.some(stock => stock.itemId === item.id))
    .map(item => {
      const stock = districtStockData.find(s => s.itemId === item.id);
      return {
        name: item.name,
        quantity: stock?.quantity || 0,
        type: stock?.isReturnable ? 'Returnable' : 'Consumable'
      };
    })
    .slice(0, 10); // Limit to 10 items for better visualization
  
  // Office-wise issuance data for charts
  const officeIssuanceData = issuanceReportData
    .reduce((acc: {name: string, issuances: number, items: number}[], iv) => {
      const existingOffice = acc.find(o => o.name === iv.receivingOfficeName);
      
      if (existingOffice) {
        existingOffice.issuances += 1;
        existingOffice.items += iv.totalItems;
      } else {
        acc.push({
          name: iv.receivingOfficeName,
          issuances: 1,
          items: iv.totalItems
        });
      }
      
      return acc;
    }, []);
  
  const handleDownload = () => {
    // In a real application, this would generate and download a CSV/Excel file
    alert("In a real application, this would download the report as a CSV/Excel file.");
  };
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">District Reports & Analytics</h1>
        </div>
        
        <Tabs defaultValue="stock" onValueChange={setReportType}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="stock">Inventory Report</TabsTrigger>
            <TabsTrigger value="issuance">Issuance Report</TabsTrigger>
            <TabsTrigger value="returns">Returns Report</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            
            {(reportType === 'issuance' || reportType === 'returns') && (
              <DatePickerWithRange
                value={dateRange}
                onChange={setDateRange}
              />
            )}
            
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
          
          <TabsContent value="stock" className="space-y-6">
            <Card>
              <CardHeader className="bg-apBlue-50">
                <CardTitle className="text-apBlue-700">Current Inventory Levels</CardTitle>
                <CardDescription>
                  Complete inventory of all items in district stock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stockChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantity" fill="#3b82f6" name="Quantity" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Ledger I (Returnable Items)</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Item Code</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {returnableItems.map((stock) => (
                        <TableRow key={stock.id}>
                          <TableCell>{stock.itemName}</TableCell>
                          <TableCell>{stock.itemCode}</TableCell>
                          <TableCell>{stock.quantity}</TableCell>
                          <TableCell>{stock.metricName}</TableCell>
                        </TableRow>
                      ))}
                      {returnableItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No returnable items found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Ledger II (Consumable Items)</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Item Code</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consumableItems.map((stock) => (
                        <TableRow key={stock.id}>
                          <TableCell>{stock.itemName}</TableCell>
                          <TableCell>{stock.itemCode}</TableCell>
                          <TableCell>{stock.quantity}</TableCell>
                          <TableCell>{stock.metricName}</TableCell>
                        </TableRow>
                      ))}
                      {consumableItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No consumable items found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="issuance" className="space-y-6">
            <Card>
              <CardHeader className="bg-apBlue-50">
                <CardTitle className="text-apBlue-700">Internal Issuance Report</CardTitle>
                <CardDescription>
                  History of items issued from district stores to internal offices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={officeIssuanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="issuances" fill="#3b82f6" name="Number of Issuances" />
                      <Bar dataKey="items" fill="#10b981" name="Total Items Issued" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IV Number</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Office</TableHead>
                      <TableHead>Receiving Staff</TableHead>
                      <TableHead>Total Items</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issuanceReportData.map((iv) => (
                      <TableRow key={iv.id}>
                        <TableCell>{iv.ivNumber}</TableCell>
                        <TableCell>{formatDate(iv.issueDate)}</TableCell>
                        <TableCell>{iv.officeName}</TableCell>
                        <TableCell>{iv.receivingStaffGNo}</TableCell>
                        <TableCell>{iv.totalItems}</TableCell>
                      </TableRow>
                    ))}
                    {issuanceReportData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No issuance data found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="returns" className="space-y-6">
            <Card>
              <CardHeader className="bg-apBlue-50">
                <CardTitle className="text-apBlue-700">Internal Returns Report (LAR)</CardTitle>
                <CardDescription>
                  History of items returned from internal offices to district stores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>LAR Number</TableHead>
                      <TableHead>Return Date</TableHead>
                      <TableHead>Original IV</TableHead>
                      <TableHead>Office</TableHead>
                      <TableHead>Total Items</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {larReportData.map((lar) => (
                      <TableRow key={lar.id}>
                        <TableCell>{lar.larNumber}</TableCell>
                        <TableCell>{formatDate(lar.returnDate)}</TableCell>
                        <TableCell>{lar.ivNumber}</TableCell>
                        <TableCell>{lar.officeName}</TableCell>
                        <TableCell>{lar.totalItems}</TableCell>
                      </TableRow>
                    ))}
                    {larReportData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No returns data found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default DistrictReports;
