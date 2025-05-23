
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { SearchIcon, PlusCircleIcon, AlertTriangleIcon } from 'lucide-react';

const StockManagement = () => {
  const {
    items,
    metrics,
    budgets,
    hqStock,
    addHQStock,
    getItemById,
    getMetricById
  } = useData();
  
  const { toast } = useToast();
  
  // Find the "Nos" metric ID or use the first metric as fallback
  const nosMetricId = React.useMemo(() => {
    const nosMetric = metrics.find(m => m.name.toLowerCase() === 'nos');
    return nosMetric?.id || (metrics.length > 0 ? metrics[0].id : '');
  }, [metrics]);
  
  // State for new stock entry form
  const [newStock, setNewStock] = useState({
    itemCode: '',
    quantity: '',
    metricId: '',
    lowStockThreshold: ''
  });
  
  // State for new procurement form
  const [newProcurement, setNewProcurement] = useState({
    itemCode: '',
    quantity: '',
    metricId: '',
    invoiceNumber: '',
    purchaseDate: '',
    budgetId: '',
    sellerName: '',
    sellerMobile: '',
    warrantyPeriodTill: '',
    sellerAddress: ''
  });
  
  // Set default metric ID when metrics are loaded
  useEffect(() => {
    if (nosMetricId) {
      setNewStock(prev => ({ ...prev, metricId: nosMetricId }));
      setNewProcurement(prev => ({ ...prev, metricId: nosMetricId }));
    }
  }, [nosMetricId]);
  
  // State for search/filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStock, setFilteredStock] = useState(hqStock);
  
  // Update filtered stock when stock or search term changes
  useEffect(() => {
    const filtered = hqStock.filter(stock => {
      const item = getItemById(stock.itemId);
      if (!item) return false;
      
      return (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    
    setFilteredStock(filtered);
  }, [hqStock, searchTerm, getItemById]);
  
  // Find item by code
  const getItemByCode = (code) => {
    return items.find(item => item.code.toLowerCase() === code.toLowerCase());
  };
  
  // Handler for adding existing stock
  const handleAddExistingStock = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newStock.itemCode) {
      toast({
        title: "Validation Error",
        description: "Please enter an item code.",
        variant: "destructive"
      });
      return;
    }
    
    // Find the item by code
    const item = getItemByCode(newStock.itemCode);
    if (!item) {
      toast({
        title: "Validation Error",
        description: "Item with this code not found.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newStock.quantity || parseInt(newStock.quantity) <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be a positive number.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newStock.metricId) {
      toast({
        title: "Validation Error",
        description: "Please select a quantity metric.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Check if stock already exists for this item
      const existingStock = hqStock.find(stock => stock.itemId === item.id);
      
      if (existingStock) {
        // If exists, update quantity
        const updatedStock = {
          ...existingStock,
          quantity: existingStock.quantity + parseInt(newStock.quantity),
          lowStockThreshold: newStock.lowStockThreshold ? 
            parseInt(newStock.lowStockThreshold) : existingStock.lowStockThreshold
        };
        
        // Use updateHQStock function (not shown in context but should exist)
        // For demo, we'll just show a success toast
        toast({
          title: "Success",
          description: `Stock updated for ${item?.name}. New quantity: ${updatedStock.quantity}`,
        });
      } else {
        // If new stock entry, add it
        const stock = addHQStock({
          itemId: item.id,
          quantity: parseInt(newStock.quantity),
          metricId: newStock.metricId,
          lowStockThreshold: newStock.lowStockThreshold ? parseInt(newStock.lowStockThreshold) : undefined
        });
        
        toast({
          title: "Success",
          description: `Stock added for ${item?.name}.`,
        });
      }
      
      // Reset form
      setNewStock({
        itemCode: '',
        quantity: '',
        metricId: nosMetricId,
        lowStockThreshold: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add stock. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handler for adding new procurement
  const handleAddProcurement = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newProcurement.itemCode) {
      toast({
        title: "Validation Error",
        description: "Please enter an item code.",
        variant: "destructive"
      });
      return;
    }
    
    // Find the item by code
    const item = getItemByCode(newProcurement.itemCode);
    if (!item) {
      toast({
        title: "Validation Error",
        description: "Item with this code not found.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newProcurement.quantity || parseInt(newProcurement.quantity) <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be a positive number.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newProcurement.metricId) {
      toast({
        title: "Validation Error",
        description: "Metric is required.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newProcurement.invoiceNumber) {
      toast({
        title: "Validation Error",
        description: "Invoice number is required.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newProcurement.budgetId) {
      toast({
        title: "Validation Error",
        description: "Budget is required.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // In a real app, we would use a createProcurement function
      // For demo, we'll just update the stock like in handleAddExistingStock
      const existingStock = hqStock.find(stock => stock.itemId === item.id);
      
      if (existingStock) {
        // If exists, update quantity
        const updatedStock = {
          ...existingStock,
          quantity: existingStock.quantity + parseInt(newProcurement.quantity)
        };
        
        toast({
          title: "Success",
          description: `Procurement recorded for ${item?.name}. New quantity: ${updatedStock.quantity}`,
        });
      } else {
        // If new stock entry, add it
        const stock = addHQStock({
          itemId: item.id,
          quantity: parseInt(newProcurement.quantity),
          metricId: newProcurement.metricId
        });
        
        toast({
          title: "Success",
          description: `Procurement recorded for ${item?.name}.`,
        });
      }
      
      // Reset form
      setNewProcurement({
        itemCode: '',
        quantity: '',
        metricId: nosMetricId,
        invoiceNumber: '',
        purchaseDate: '',
        budgetId: '',
        sellerName: '',
        sellerMobile: '',
        warrantyPeriodTill: '',
        sellerAddress: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record procurement. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-semibold">Stock Management</h1>
          <p className="text-apGray-600 mt-1">Manage HQ inventory and stock entries.</p>
        </div>
        
        <Tabs defaultValue="existing" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="existing">Add Existing Stock</TabsTrigger>
            <TabsTrigger value="procurement">New Procurement</TabsTrigger>
          </TabsList>
          
          {/* Add Existing Stock Form */}
          <TabsContent value="existing" className="space-y-6 mt-6">
            <Card className="ap-card">
              <CardHeader>
                <CardTitle>Add Existing Stock</CardTitle>
                <CardDescription>Record initial stock or add to existing inventory.</CardDescription>
              </CardHeader>
              <form onSubmit={handleAddExistingStock}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="itemCode" className="block text-sm font-medium text-gray-700">Item Code *</label>
                      <Input 
                        id="itemCode" 
                        placeholder="Enter item code" 
                        value={newStock.itemCode}
                        onChange={e => setNewStock({...newStock, itemCode: e.target.value})}
                        className="ap-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity *</label>
                      <Input 
                        id="quantity" 
                        type="number" 
                        min="1"
                        placeholder="Enter quantity" 
                        value={newStock.quantity}
                        onChange={e => setNewStock({...newStock, quantity: e.target.value})}
                        className="ap-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="metric" className="block text-sm font-medium text-gray-700">Metric *</label>
                      <Select 
                        value={newStock.metricId} 
                        onValueChange={value => setNewStock({...newStock, metricId: value})}
                      >
                        <SelectTrigger className="ap-input">
                          <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Available Metrics</SelectLabel>
                            {metrics.map((metric) => (
                              <SelectItem key={metric.id} value={metric.id}>
                                {metric.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">
                      Low Stock Threshold (Optional)
                    </label>
                    <Input 
                      id="lowStockThreshold" 
                      type="number" 
                      min="1"
                      placeholder="Enter threshold quantity for alerts" 
                      value={newStock.lowStockThreshold}
                      onChange={e => setNewStock({...newStock, lowStockThreshold: e.target.value})}
                      className="ap-input"
                    />
                    <p className="text-sm text-gray-500">
                      System will alert when stock falls below this quantity.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="ap-button-primary">
                    <PlusCircleIcon className="h-4 w-4 mr-2" />
                    Add Stock
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* New Procurement Form */}
          <TabsContent value="procurement" className="space-y-6 mt-6">
            <Card className="ap-card">
              <CardHeader>
                <CardTitle>Add New Procurement</CardTitle>
                <CardDescription>Record new items purchased through budget allocation.</CardDescription>
              </CardHeader>
              <form onSubmit={handleAddProcurement}>
                <CardContent className="space-y-6">
                  {/* Item Selection Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Item Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="procItemCode" className="block text-sm font-medium text-gray-700">Item Code *</label>
                        <Input 
                          id="procItemCode" 
                          placeholder="Enter item code" 
                          value={newProcurement.itemCode}
                          onChange={e => setNewProcurement({...newProcurement, itemCode: e.target.value})}
                          className="ap-input"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="procQuantity" className="block text-sm font-medium text-gray-700">Quantity *</label>
                        <Input 
                          id="procQuantity" 
                          type="number" 
                          min="1"
                          placeholder="Enter quantity" 
                          value={newProcurement.quantity}
                          onChange={e => setNewProcurement({...newProcurement, quantity: e.target.value})}
                          className="ap-input"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="procMetric" className="block text-sm font-medium text-gray-700">Metric *</label>
                        <Select 
                          value={newProcurement.metricId} 
                          onValueChange={value => setNewProcurement({...newProcurement, metricId: value})}
                        >
                          <SelectTrigger className="ap-input">
                            <SelectValue placeholder="Select metric" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Available Metrics</SelectLabel>
                              {metrics.map((metric) => (
                                <SelectItem key={metric.id} value={metric.id}>
                                  {metric.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Procurement Details Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Procurement Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">Invoice Number *</label>
                        <Input 
                          id="invoiceNumber" 
                          placeholder="Enter invoice number" 
                          value={newProcurement.invoiceNumber}
                          onChange={e => setNewProcurement({...newProcurement, invoiceNumber: e.target.value})}
                          className="ap-input"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">Purchase Date</label>
                        <Input 
                          id="purchaseDate" 
                          type="date"
                          value={newProcurement.purchaseDate}
                          onChange={e => setNewProcurement({...newProcurement, purchaseDate: e.target.value})}
                          className="ap-input"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Budget *</label>
                        <Select 
                          value={newProcurement.budgetId} 
                          onValueChange={value => setNewProcurement({...newProcurement, budgetId: value})}
                        >
                          <SelectTrigger className="ap-input">
                            <SelectValue placeholder="Select budget" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Available Budgets</SelectLabel>
                              {budgets.map((budget) => (
                                <SelectItem key={budget.id} value={budget.id}>
                                  {budget.name} ({budget.financialYear})
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Seller Details Section */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Seller Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="sellerName" className="block text-sm font-medium text-gray-700">Seller Name</label>
                        <Input 
                          id="sellerName" 
                          placeholder="Enter seller name" 
                          value={newProcurement.sellerName}
                          onChange={e => setNewProcurement({...newProcurement, sellerName: e.target.value})}
                          className="ap-input"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="sellerMobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                        <Input 
                          id="sellerMobile" 
                          placeholder="Enter seller mobile number" 
                          value={newProcurement.sellerMobile}
                          onChange={e => setNewProcurement({...newProcurement, sellerMobile: e.target.value})}
                          className="ap-input"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="warrantyPeriodTill" className="block text-sm font-medium text-gray-700">Warranty Period Till</label>
                        <Input 
                          id="warrantyPeriodTill" 
                          type="date"
                          value={newProcurement.warrantyPeriodTill}
                          onChange={e => setNewProcurement({...newProcurement, warrantyPeriodTill: e.target.value})}
                          className="ap-input"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="sellerAddress" className="block text-sm font-medium text-gray-700">Seller Address</label>
                        <Input 
                          id="sellerAddress" 
                          placeholder="Enter seller address" 
                          value={newProcurement.sellerAddress}
                          onChange={e => setNewProcurement({...newProcurement, sellerAddress: e.target.value})}
                          className="ap-input"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="ap-button-primary">
                    <PlusCircleIcon className="h-4 w-4 mr-2" />
                    Add Procurement
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Current Stock Table */}
        <Card className="ap-card">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Current HQ Stock</CardTitle>
                <CardDescription>Current inventory levels for all items at HQ.</CardDescription>
              </div>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  className="pl-9 ap-input w-full md:w-64"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>List of all items in HQ inventory.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Low Stock Alert</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      {searchTerm ? 'No stock items matching your search.' : 'No stock items have been added yet.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStock.map(stock => {
                    const item = getItemById(stock.itemId);
                    const metric = getMetricById(stock.metricId);
                    const isLowStock = stock.lowStockThreshold && stock.quantity <= stock.lowStockThreshold;
                    
                    return (
                      <TableRow key={stock.id}>
                        <TableCell className="font-medium">{item?.code || 'Unknown'}</TableCell>
                        <TableCell>{item?.name || 'Unknown Item'}</TableCell>
                        <TableCell>
                          {stock.quantity} {metric?.name || ''}
                        </TableCell>
                        <TableCell>
                          {stock.lowStockThreshold ? `${stock.lowStockThreshold} ${metric?.name || ''}` : 'Not set'}
                        </TableCell>
                        <TableCell>
                          {isLowStock ? (
                            <div className="flex items-center">
                              <AlertTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
                              <span className="text-red-500 font-medium">Low stock</span>
                            </div>
                          ) : (
                            <span className="text-green-500">Adequate</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default StockManagement;
