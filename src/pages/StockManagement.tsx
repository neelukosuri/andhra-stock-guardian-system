
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { 
  SearchIcon, 
  PlusCircleIcon, 
  ArrowDownCircleIcon,
  Package,
  ArchiveRestore 
} from 'lucide-react';
import { HQStockWithDetails } from '@/types';

const StockManagement = () => {
  const { 
    items, 
    hqStock, 
    metrics, 
    budgets, 
    addHQStock, 
    getItemById,
    getMetricById
  } = useData();
  
  const { toast } = useToast();
  
  // States for the existing stock form
  const [existingStock, setExistingStock] = useState({
    itemId: '',
    quantity: 0,
    metricId: '',
    lowStockThreshold: 5 // Default value
  });
  
  // States for the new procurement form
  const [newProcurement, setNewProcurement] = useState({
    itemId: '',
    quantity: 0,
    metricId: '',
    invoiceNumber: '',
    purchaseDate: '',
    budgetId: '',
    sellerName: '',
    sellerMobile: '',
    sellerAddress: '',
    warrantyPeriodTill: ''
  });
  
  // State for search and filtering the stock table
  const [searchTerm, setSearchTerm] = useState('');
  const [stockWithDetails, setStockWithDetails] = useState<HQStockWithDetails[]>([]);
  const [filteredStock, setFilteredStock] = useState<HQStockWithDetails[]>([]);
  
  // Initialize the current date for the purchase date field
  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0];
    setNewProcurement(prev => ({...prev, purchaseDate: currentDate}));
  }, []);
  
  // Enhance stock with item details
  useEffect(() => {
    const enhanced = hqStock.map(stock => {
      const item = getItemById(stock.itemId);
      const metric = getMetricById(stock.metricId);
      
      return {
        ...stock,
        itemName: item?.name || 'Unknown Item',
        itemCode: item?.code || 'Unknown Code',
        metricName: metric?.name || 'Unknown Metric'
      };
    });
    
    setStockWithDetails(enhanced);
    setFilteredStock(enhanced);
  }, [hqStock, getItemById, getMetricById]);
  
  // Update filtered stock when search term changes
  useEffect(() => {
    const filtered = stockWithDetails.filter(stock => 
      stock.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      stock.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStock(filtered);
  }, [stockWithDetails, searchTerm]);
  
  // Handler for adding existing stock
  const handleAddExistingStock = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!existingStock.itemId) {
      toast({
        title: "Validation Error",
        description: "Please select an item.",
        variant: "destructive"
      });
      return;
    }
    
    if (!existingStock.metricId) {
      toast({
        title: "Validation Error",
        description: "Please select a quantity metric.",
        variant: "destructive"
      });
      return;
    }
    
    if (existingStock.quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if the item already exists in stock
    const existingStockItem = hqStock.find(s => s.itemId === existingStock.itemId);
    
    if (existingStockItem) {
      // Update existing stock quantity
      const updatedQuantity = existingStockItem.quantity + existingStock.quantity;
      
      try {
        // In a real app, we would update the existing stock record
        // For this mock, we'll simulate by adding a new stock item
        addHQStock({
          itemId: existingStock.itemId,
          quantity: updatedQuantity,
          metricId: existingStock.metricId,
          lowStockThreshold: existingStock.lowStockThreshold
        });
        
        const item = getItemById(existingStock.itemId);
        
        toast({
          title: "Stock Updated",
          description: `${item?.name} stock updated to ${updatedQuantity} units.`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update stock. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      // Add new stock entry
      try {
        const newStock = addHQStock({
          itemId: existingStock.itemId,
          quantity: existingStock.quantity,
          metricId: existingStock.metricId,
          lowStockThreshold: existingStock.lowStockThreshold
        });
        
        const item = getItemById(newStock.itemId);
        
        toast({
          title: "Stock Added",
          description: `${item?.name} added to stock with ${newStock.quantity} units.`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add stock. Please try again.",
          variant: "destructive"
        });
      }
    }
    
    // Reset form
    setExistingStock({
      itemId: '',
      quantity: 0,
      metricId: '',
      lowStockThreshold: 5
    });
  };
  
  // Handler for adding new procurement
  const handleAddNewProcurement = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validations
    if (!newProcurement.itemId || !newProcurement.metricId || !newProcurement.budgetId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (newProcurement.quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, we would create a procurement record and update stock
    // For this mock, we'll just add to stock
    try {
      // Check if the item already exists in stock
      const existingStockItem = hqStock.find(s => s.itemId === newProcurement.itemId);
      
      if (existingStockItem) {
        // Update existing stock quantity
        const updatedQuantity = existingStockItem.quantity + newProcurement.quantity;
        
        // In a real app, we would update the existing stock record
        addHQStock({
          itemId: newProcurement.itemId,
          quantity: updatedQuantity,
          metricId: newProcurement.metricId,
          lowStockThreshold: 5 // Default value
        });
      } else {
        // Add new stock entry
        addHQStock({
          itemId: newProcurement.itemId,
          quantity: newProcurement.quantity,
          metricId: newProcurement.metricId,
          lowStockThreshold: 5 // Default value
        });
      }
      
      const item = getItemById(newProcurement.itemId);
      
      toast({
        title: "Procurement Added",
        description: `${newProcurement.quantity} units of ${item?.name} added to stock.`
      });
      
      // Reset form
      setNewProcurement({
        itemId: '',
        quantity: 0,
        metricId: '',
        invoiceNumber: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        budgetId: '',
        sellerName: '',
        sellerMobile: '',
        sellerAddress: '',
        warrantyPeriodTill: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add procurement. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-semibold">Stock Management</h1>
          <p className="text-apGray-600 mt-1">Manage existing stock and new procurements.</p>
        </div>
        
        <Tabs defaultValue="existingStock" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="existingStock">Existing Stock</TabsTrigger>
            <TabsTrigger value="newProcurement">New Procurement</TabsTrigger>
          </TabsList>
          
          <TabsContent value="existingStock" className="space-y-6 mt-6">
            {/* Add Existing Stock Form */}
            <Card className="ap-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5 text-apBlue-600" />
                  Add Existing Stock
                </CardTitle>
                <CardDescription>Add items to the existing inventory stock.</CardDescription>
              </CardHeader>
              <form onSubmit={handleAddExistingStock}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="item" className="block text-sm font-medium text-gray-700">Item *</label>
                      <Select 
                        value={existingStock.itemId} 
                        onValueChange={value => setExistingStock({...existingStock, itemId: value})}
                      >
                        <SelectTrigger className="ap-input">
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Available Items</SelectLabel>
                            {items.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.code} - {item.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="metric" className="block text-sm font-medium text-gray-700">Quantity Metric *</label>
                      <Select 
                        value={existingStock.metricId} 
                        onValueChange={value => setExistingStock({...existingStock, metricId: value})}
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity *</label>
                      <Input 
                        id="quantity" 
                        type="number" 
                        placeholder="Enter quantity" 
                        value={existingStock.quantity || ''}
                        onChange={e => setExistingStock({...existingStock, quantity: parseInt(e.target.value) || 0})}
                        className="ap-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                      <Input 
                        id="lowStockThreshold" 
                        type="number" 
                        placeholder="Set threshold for low stock alert" 
                        value={existingStock.lowStockThreshold || ''}
                        onChange={e => setExistingStock({...existingStock, lowStockThreshold: parseInt(e.target.value) || 0})}
                        className="ap-input"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="ap-button-primary">
                    <PlusCircleIcon className="h-4 w-4 mr-2" />
                    Add to Stock
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            {/* View HQ Stock */}
            <Card className="ap-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Current HQ Stock</CardTitle>
                    <CardDescription>All items currently in HQ inventory.</CardDescription>
                  </div>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      className="pl-9 ap-input w-full md:w-64"
                      placeholder="Search stock..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>A list of all items in HQ inventory.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStock.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                          {searchTerm ? 'No items matching your search.' : 'No items in stock yet.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStock.map(stock => (
                        <TableRow key={stock.id}>
                          <TableCell className="font-medium">{stock.itemCode}</TableCell>
                          <TableCell>{stock.itemName}</TableCell>
                          <TableCell className="text-right">{stock.quantity} {stock.metricName}</TableCell>
                          <TableCell>
                            {stock.quantity <= (stock.lowStockThreshold || 5) ? (
                              <Badge variant="destructive">Low Stock</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Stock</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="newProcurement" className="space-y-6 mt-6">
            {/* Add New Procurement Form */}
            <Card className="ap-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowDownCircleIcon className="mr-2 h-5 w-5 text-apBlue-600" />
                  Add New Procurement
                </CardTitle>
                <CardDescription>Record details of newly procured inventory items.</CardDescription>
              </CardHeader>
              <form onSubmit={handleAddNewProcurement}>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="procItem" className="block text-sm font-medium text-gray-700">Item *</label>
                      <Select 
                        value={newProcurement.itemId} 
                        onValueChange={value => setNewProcurement({...newProcurement, itemId: value})}
                      >
                        <SelectTrigger className="ap-input">
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Available Items</SelectLabel>
                            {items.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.code} - {item.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="procQuantity" className="block text-sm font-medium text-gray-700">Quantity *</label>
                      <Input 
                        id="procQuantity" 
                        type="number" 
                        placeholder="Enter quantity" 
                        value={newProcurement.quantity || ''}
                        onChange={e => setNewProcurement({...newProcurement, quantity: parseInt(e.target.value) || 0})}
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
                      <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">Purchase Date *</label>
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
                                {budget.name} - {budget.financialYear}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-medium mb-3 text-gray-700">Seller Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <label htmlFor="sellerMobile" className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <Input 
                          id="sellerMobile" 
                          placeholder="Enter contact number" 
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
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <label htmlFor="sellerAddress" className="block text-sm font-medium text-gray-700">Address</label>
                      <Input 
                        id="sellerAddress" 
                        placeholder="Enter seller address" 
                        value={newProcurement.sellerAddress}
                        onChange={e => setNewProcurement({...newProcurement, sellerAddress: e.target.value})}
                        className="ap-input"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="ap-button-primary">
                    <ArrowDownCircleIcon className="h-4 w-4 mr-2" />
                    Add Procurement
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default StockManagement;
