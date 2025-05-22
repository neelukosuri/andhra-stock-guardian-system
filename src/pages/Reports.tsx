import React from 'react';
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

const Reports = () => {
  const { 
    items, 
    hqStock, 
    metrics, 
    hqIssuanceVouchers,
    hqLarVouchers,
    hqItemMovements,
    loanItems,
    districts 
  } = useData();
  
  const [reportType, setReportType] = useState('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  
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
  
  // Helper to get district name
  const getDistrictName = (districtId: string) => {
    const district = districts.find(d => d.id === districtId);
    return district ? district.name : 'Unknown District';
  };
  
  // Helper to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Generate stock report data
  const stockReportData = hqStock
    .map(stock => {
      const item = items.find(i => i.id === stock.itemId);
      return {
        ...stock,
        itemName: item?.name || 'Unknown Item',
        metricName: getMetricName(stock.metricId)
      };
    })
    .filter(stock => 
      stock.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  // Generate issuance report data
  const issuanceReportData = hqIssuanceVouchers
    .map(iv => {
      const district = districts.find(d => d.id === iv.receivingDistrictId);
      const movementsForIV = hqItemMovements.filter(m => m.ivId === iv.id);
      const totalItems = movementsForIV.length;
      
      return {
        ...iv,
        districtName: district?.name || 'Unknown District',
        totalItems,
        issuedDate: new Date(iv.issueDate)
      };
    })
    .filter(iv => {
      // Filter by search query
      if (searchQuery && !iv.districtName.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !iv.ivNumber.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by district
      if (selectedDistrict && iv.receivingDistrictId !== selectedDistrict) {
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
  
  // Generate return (LAR) report data
  const larReportData = hqLarVouchers
    .map(lar => {
      const iv = hqIssuanceVouchers.find(i => i.id === lar.ivIdRef);
      const district = iv ? districts.find(d => d.id === iv.receivingDistrictId) : null;
      const movementsForLAR = hqItemMovements.filter(m => m.larId === lar.id);
      const totalItems = movementsForLAR.length;
      
      return {
        ...lar,
        districtName: district?.name || 'Unknown District',
        ivNumber: iv?.ivNumber || 'Unknown',
        totalItems,
        returnedDate: new Date(lar.returnDate)
      };
    })
    .filter(lar => {
      // Filter by search query
      if (searchQuery && !lar.districtName.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !lar.larNumber.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by district
      if (selectedDistrict) {
        const iv = hqIssuanceVouchers.find(i => i.id === lar.ivIdRef);
        if (!iv || iv.receivingDistrictId !== selectedDistrict) {
          return false;
        }
      }
      
      // Filter by date range
      if (dateRange?.from && dateRange?.to) {
        return lar.returnedDate >= dateRange.from && lar.returnedDate <= dateRange.to;
      } else if (dateRange?.from) {
        return lar.returnedDate >= dateRange.from;
      }
      
      return true;
    });
  
  // Generate loan items report data
  const loanItemsReportData = loanItems
    .filter(loan => {
      // Filter by search query
      if (searchQuery) {
        const itemName = getItemName(loan.itemId);
        return itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
               loan.sourceWing.toLowerCase().includes(searchQuery.toLowerCase()) ||
               loan.eventName.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return true;
    });
  
  // Generate data for charts
  const stockChartData = items.map(item => {
    const stock = hqStock.find(s => s.itemId === item.id);
    return {
      name: item.name,
      quantity: stock?.quantity || 0
    };
  }).slice(0, 10); // Limit to 10 items for better visualization
  
  // District-wise issuance data for charts
  const districtIssuanceData = districts.map(district => {
    const issuances = hqIssuanceVouchers.filter(iv => iv.receivingDistrictId === district.id);
    const totalIssuedItems = issuances.reduce((total, iv) => {
      const movementsForIV = hqItemMovements.filter(m => m.ivId === iv.id);
      return total + movementsForIV.length;
    }, 0);
    
    return {
      name: district.name,
      issuances: issuances.length,
      items: totalIssuedItems
    };
  });
  
  const handleDownload = () => {
    // In a real application, this would generate and download a CSV/Excel file
    alert("In a real application, this would download the report as a CSV/Excel file.");
  };
  
  // Anywhere in the code where item.itemCode is used, replace with item.code
  const processData = (items) => {
    return items.map(item => ({
      ...item,
      displayCode: item.code // Use code instead of itemCode
    }));
  }
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        </div>
        
        <Tabs defaultValue="stock" onValueChange={setReportType}>
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-6">
            <TabsTrigger value="stock">Stock Report</TabsTrigger>
            <TabsTrigger value="issuance">Issuance Report</TabsTrigger>
            <TabsTrigger value="returns">Returns Report</TabsTrigger>
            <TabsTrigger value="loans">Loan Items Report</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            
            {(reportType === 'issuance' || reportType === 'returns') && (
              <>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by district" />
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
                
                <DatePickerWithRange
                  value={dateRange}
                  onChange={setDateRange}
                />
              </>
            )}
            
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
          
          <TabsContent value="stock" className="space-y-6">
            <Card>
              <CardHeader className="bg-apBlue-50">
                <CardTitle className="text-apBlue-700">Current Stock Levels</CardTitle>
                <CardDescription>
                  Complete inventory of all items in HQ stock
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
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockReportData.map((stock) => {
                      const item = items.find(i => i.id === stock.itemId);
                      const isLowStock = stock.quantity <= (stock.lowStockThreshold || 5);
                      
                      return (
                        <TableRow key={stock.id}>
                          <TableCell>{stock.itemName}</TableCell>
                          <TableCell>{item?.displayCode || 'N/A'}</TableCell>
                          <TableCell>{stock.quantity}</TableCell>
                          <TableCell>{stock.metricName}</TableCell>
                          <TableCell>
                            <Badge
                              variant={isLowStock ? "destructive" : "default"}
                              className={isLowStock ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                            >
                              {isLowStock ? "Low Stock" : "In Stock"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {stockReportData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No stock data found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="issuance" className="space-y-6">
            <Card>
              <CardHeader className="bg-apBlue-50">
                <CardTitle className="text-apBlue-700">Issuance Report</CardTitle>
                <CardDescription>
                  History of items issued from HQ to districts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={districtIssuanceData}>
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
                      <TableHead>District</TableHead>
                      <TableHead>Receiving Staff</TableHead>
                      <TableHead>Total Items</TableHead>
                      <TableHead>Approval Ref</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issuanceReportData.map((iv) => (
                      <TableRow key={iv.id}>
                        <TableCell>{iv.ivNumber}</TableCell>
                        <TableCell>{formatDate(iv.issueDate)}</TableCell>
                        <TableCell>{iv.districtName}</TableCell>
                        <TableCell>{iv.receivingStaffGNo}</TableCell>
                        <TableCell>{iv.totalItems}</TableCell>
                        <TableCell>{iv.approvalRefNo}</TableCell>
                      </TableRow>
                    ))}
                    {issuanceReportData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
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
                <CardTitle className="text-apBlue-700">Returns Report (LAR)</CardTitle>
                <CardDescription>
                  History of items returned from districts to HQ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>LAR Number</TableHead>
                      <TableHead>Return Date</TableHead>
                      <TableHead>Original IV</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Total Items</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {larReportData.map((lar) => (
                      <TableRow key={lar.id}>
                        <TableCell>{lar.larNumber}</TableCell>
                        <TableCell>{formatDate(lar.returnDate)}</TableCell>
                        <TableCell>{lar.ivNumber}</TableCell>
                        <TableCell>{lar.districtName}</TableCell>
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
          
          <TabsContent value="loans" className="space-y-6">
            <Card>
              <CardHeader className="bg-apBlue-50">
                <CardTitle className="text-apBlue-700">Loan Items Report</CardTitle>
                <CardDescription>
                  Status of all items received on loan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Source Wing</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Expected Return</TableHead>
                      <TableHead>Actual Return</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanItemsReportData.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>{getItemName(loan.itemId)}</TableCell>
                        <TableCell>{loan.sourceWing}</TableCell>
                        <TableCell>{loan.eventName}</TableCell>
                        <TableCell>{formatDate(loan.expectedReturnDate)}</TableCell>
                        <TableCell>{formatDate(loan.actualReturnDate)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={loan.status === 'Returned' ? "outline" : "default"}
                            className={loan.status === 'Returned' ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
                          >
                            {loan.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {loanItemsReportData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No loan items found
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

export default Reports;
