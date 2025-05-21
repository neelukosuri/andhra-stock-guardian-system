
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Archive, SearchIcon, CheckCircleIcon, CalendarIcon } from 'lucide-react';
import { LoanItemWithDetails } from '@/types';

const LoanItems = () => {
  const { 
    items, 
    metrics, 
    loanItems, 
    addLoanItem, 
    updateLoanItem, 
    getItemById,
    getMetricById 
  } = useData();
  
  const { toast } = useToast();
  
  // State for loan item form
  const [newLoanItem, setNewLoanItem] = useState({
    itemId: '',
    quantity: 0,
    metricId: '',
    sourceWing: '',
    eventName: '',
    expectedReturnDate: '',
  });
  
  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Loaned' | 'Returned'>('all');
  const [loanItemsWithDetails, setLoanItemsWithDetails] = useState<LoanItemWithDetails[]>([]);
  const [filteredLoanItems, setFilteredLoanItems] = useState<LoanItemWithDetails[]>([]);
  
  // Initialize with current date
  useEffect(() => {
    // Set expected return date to 30 days from now by default
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    setNewLoanItem(prev => ({
      ...prev, 
      expectedReturnDate: thirtyDaysFromNow.toISOString().split('T')[0]
    }));
  }, []);
  
  // Enhance loan items with item details
  useEffect(() => {
    const enhanced = loanItems.map(loanItem => {
      const item = getItemById(loanItem.itemId);
      const metric = getMetricById(loanItem.metricId);
      
      return {
        ...loanItem,
        itemName: item?.name || 'Unknown Item',
        itemCode: item?.code || 'Unknown Code',
        metricName: metric?.name || 'Unknown Metric'
      };
    });
    
    setLoanItemsWithDetails(enhanced);
  }, [loanItems, getItemById, getMetricById]);
  
  // Update filtered items when search term or status filter changes
  useEffect(() => {
    const filtered = loanItemsWithDetails.filter(item => {
      const matchesSearch = 
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sourceWing.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.eventName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredLoanItems(filtered);
  }, [loanItemsWithDetails, searchTerm, statusFilter]);
  
  // Handler for adding new loan items
  const handleAddLoanItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!newLoanItem.itemId || !newLoanItem.metricId) {
      toast({
        title: "Validation Error",
        description: "Please select an item and quantity metric.",
        variant: "destructive"
      });
      return;
    }
    
    if (newLoanItem.quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newLoanItem.sourceWing.trim()) {
      toast({
        title: "Validation Error",
        description: "Source wing is required.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newLoanItem.eventName.trim()) {
      toast({
        title: "Validation Error",
        description: "Event name is required.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newLoanItem.expectedReturnDate) {
      toast({
        title: "Validation Error",
        description: "Expected return date is required.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const loanItem = addLoanItem(newLoanItem);
      const item = getItemById(loanItem.itemId);
      
      toast({
        title: "Loan Item Added",
        description: `${loanItem.quantity} ${getMetricById(loanItem.metricId)?.name} of ${item?.name} added to loan items.`
      });
      
      // Reset form
      setNewLoanItem({
        itemId: '',
        quantity: 0,
        metricId: '',
        sourceWing: '',
        eventName: '',
        expectedReturnDate: '',
      });
      
      // Set expected return date to 30 days from now
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      setNewLoanItem(prev => ({
        ...prev, 
        expectedReturnDate: thirtyDaysFromNow.toISOString().split('T')[0]
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add loan item. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handler for marking loan item as returned
  const handleMarkAsReturned = (id: string, itemName: string) => {
    try {
      updateLoanItem(id, { 
        status: 'Returned', 
        actualReturnDate: new Date().toISOString()
      });
      
      toast({
        title: "Item Returned",
        description: `${itemName} has been marked as returned.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item status. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Check if an item is overdue
  const isOverdue = (item: LoanItemWithDetails) => {
    if (item.status === 'Returned') return false;
    
    const today = new Date();
    const expectedDate = new Date(item.expectedReturnDate);
    return today > expectedDate;
  };
  
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-semibold">Loan Item Management</h1>
          <p className="text-apGray-600 mt-1">Manage items received on loan from external sources.</p>
        </div>
        
        <Tabs defaultValue="loanItems" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="loanItems">Loan Items</TabsTrigger>
            <TabsTrigger value="addLoanItem">Add Loan Item</TabsTrigger>
          </TabsList>
          
          <TabsContent value="loanItems" className="space-y-6 mt-6">
            {/* Loan Items Table */}
            <Card className="ap-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Loan Items</CardTitle>
                    <CardDescription>Items received on loan from external sources.</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        className="pl-9 ap-input w-full"
                        placeholder="Search loan items..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select 
                      value={statusFilter} 
                      onValueChange={(value: 'all' | 'Loaned' | 'Returned') => setStatusFilter(value)}
                    >
                      <SelectTrigger className="ap-input w-full sm:w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Loaned">Loaned</SelectItem>
                        <SelectItem value="Returned">Returned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>A list of all loan items.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Expected Return</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLoanItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                          {searchTerm || statusFilter !== 'all' ? 'No loan items matching your criteria.' : 'No loan items have been added yet.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLoanItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.itemName}</p>
                              <p className="text-xs text-apGray-500">{item.itemCode}</p>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity} {item.metricName}</TableCell>
                          <TableCell>{item.sourceWing}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{item.eventName}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <CalendarIcon className="h-3.5 w-3.5 mr-1 text-apGray-500" />
                              {formatDate(item.expectedReturnDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.status === 'Returned' ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Returned {formatDate(item.actualReturnDate)}
                              </Badge>
                            ) : isOverdue(item) ? (
                              <Badge variant="destructive">Overdue</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                On Loan
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.status === 'Loaned' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleMarkAsReturned(item.id, item.itemName!)}
                              >
                                <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                                Mark Returned
                              </Button>
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
          
          <TabsContent value="addLoanItem" className="space-y-6 mt-6">
            {/* Add Loan Item Form */}
            <Card className="ap-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Archive className="mr-2 h-5 w-5 text-apBlue-600" />
                  Add Loan Item
                </CardTitle>
                <CardDescription>Record items received on loan from other departments or organizations.</CardDescription>
              </CardHeader>
              <form onSubmit={handleAddLoanItem}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="item" className="block text-sm font-medium text-gray-700">Item *</label>
                      <Select 
                        value={newLoanItem.itemId} 
                        onValueChange={value => setNewLoanItem({...newLoanItem, itemId: value})}
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
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity *</label>
                      <Input 
                        id="quantity" 
                        type="number" 
                        placeholder="Enter quantity" 
                        value={newLoanItem.quantity || ''}
                        onChange={e => setNewLoanItem({...newLoanItem, quantity: parseInt(e.target.value) || 0})}
                        className="ap-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="metric" className="block text-sm font-medium text-gray-700">Metric *</label>
                      <Select 
                        value={newLoanItem.metricId} 
                        onValueChange={value => setNewLoanItem({...newLoanItem, metricId: value})}
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
                      <label htmlFor="sourceWing" className="block text-sm font-medium text-gray-700">Source Wing/Department *</label>
                      <Input 
                        id="sourceWing" 
                        placeholder="e.g., Forest, DCPW, Private Firm" 
                        value={newLoanItem.sourceWing}
                        onChange={e => setNewLoanItem({...newLoanItem, sourceWing: e.target.value})}
                        className="ap-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="eventName" className="block text-sm font-medium text-gray-700">Event Name *</label>
                      <Input 
                        id="eventName" 
                        placeholder="e.g., Election 2025, Special Bandobast" 
                        value={newLoanItem.eventName}
                        onChange={e => setNewLoanItem({...newLoanItem, eventName: e.target.value})}
                        className="ap-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="expectedReturnDate" className="block text-sm font-medium text-gray-700">Expected Return Date *</label>
                      <Input 
                        id="expectedReturnDate" 
                        type="date" 
                        value={newLoanItem.expectedReturnDate}
                        onChange={e => setNewLoanItem({...newLoanItem, expectedReturnDate: e.target.value})}
                        className="ap-input"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="ap-button-primary">
                    <Archive className="h-4 w-4 mr-2" />
                    Add Loan Item
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

export default LoanItems;
