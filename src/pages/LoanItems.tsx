
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
import { SearchIcon, PlusCircleIcon, ArrowRightIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const LoanItems = () => {
  const {
    items,
    metrics,
    loanItems,
    addLoanItem,
    getItemById,
    getMetricById
  } = useData();
  
  const { toast } = useToast();
  
  // State for loan item form
  const [newLoanItem, setNewLoanItem] = useState({
    itemId: '',
    quantity: '',
    metricId: '',
    sourceWing: '',
    eventName: '',
    expectedReturnDate: ''
  });
  
  // State for search/filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLoanItems, setFilteredLoanItems] = useState(loanItems);
  
  // Update filtered items when items or search term changes
  useEffect(() => {
    const filtered = loanItems.filter(loanItem => {
      const item = getItemById(loanItem.itemId);
      if (!item) return false;
      
      return (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loanItem.sourceWing.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loanItem.eventName?.toLowerCase().includes(searchTerm.toLowerCase() || '')
      );
    });
    
    setFilteredLoanItems(filtered);
  }, [loanItems, searchTerm, getItemById]);
  
  // Handler for adding new loan item
  const handleAddLoanItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newLoanItem.itemId) {
      toast({
        title: "Validation Error",
        description: "Please select an item.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newLoanItem.quantity || parseInt(newLoanItem.quantity) <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be a positive number.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newLoanItem.metricId) {
      toast({
        title: "Validation Error",
        description: "Please select a quantity metric.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newLoanItem.sourceWing) {
      toast({
        title: "Validation Error",
        description: "Source wing is required.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Convert quantity to number
      const quantity = parseInt(newLoanItem.quantity);
      
      const loanItem = addLoanItem({
        ...newLoanItem,
        quantity,
        expectedReturnDate: newLoanItem.expectedReturnDate || new Date().toISOString()
      });
      
      const item = getItemById(loanItem.itemId);
      
      toast({
        title: "Success",
        description: `Loan item ${item?.name} added successfully.`,
      });
      
      // Reset the form
      setNewLoanItem({
        itemId: '',
        quantity: '',
        metricId: '',
        sourceWing: '',
        eventName: '',
        expectedReturnDate: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add loan item. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold">Loan Item Management</h1>
            <p className="text-apGray-600 mt-1">Manage items received on loan from other departments or agencies.</p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to="/loan-items-return">
              <ArrowRightIcon className="mr-2 h-4 w-4" />
              Process Returns
            </Link>
          </Button>
        </div>
        
        {/* Add New Loan Item Form */}
        <Card className="ap-card">
          <CardHeader>
            <CardTitle>Add New Loan Item</CardTitle>
            <CardDescription>Record a new item received on loan.</CardDescription>
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
                    min="1"
                    placeholder="Enter quantity" 
                    value={newLoanItem.quantity}
                    onChange={e => setNewLoanItem({...newLoanItem, quantity: e.target.value})}
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
                    placeholder="e.g. Forest, DCPW, Private Firm" 
                    value={newLoanItem.sourceWing}
                    onChange={e => setNewLoanItem({...newLoanItem, sourceWing: e.target.value})}
                    className="ap-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="eventName" className="block text-sm font-medium text-gray-700">Event Name</label>
                  <Input 
                    id="eventName" 
                    placeholder="Associated event or purpose" 
                    value={newLoanItem.eventName}
                    onChange={e => setNewLoanItem({...newLoanItem, eventName: e.target.value})}
                    className="ap-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="expectedReturnDate" className="block text-sm font-medium text-gray-700">Expected Return Date</label>
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
                <PlusCircleIcon className="h-4 w-4 mr-2" />
                Add Loan Item
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Loan Items Table */}
        <Card className="ap-card">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Loan Items</CardTitle>
                <CardDescription>All items received on loan from other departments.</CardDescription>
              </div>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  className="pl-9 ap-input w-full md:w-64"
                  placeholder="Search loan items..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>List of all items received on loan.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Source Wing</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Expected Return</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoanItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      {searchTerm ? 'No loan items matching your search.' : 'No loan items have been added yet.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLoanItems.map(loanItem => {
                    const item = getItemById(loanItem.itemId);
                    const metric = getMetricById(loanItem.metricId);
                    const isOverdue = loanItem.status === 'Loaned' && new Date(loanItem.expectedReturnDate) < new Date();
                    
                    return (
                      <TableRow key={loanItem.id} className={isOverdue ? "bg-red-50" : ""}>
                        <TableCell>
                          {item ? (
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.code}</div>
                            </div>
                          ) : 'Unknown Item'}
                        </TableCell>
                        <TableCell>
                          {loanItem.quantity} {metric?.name || ''}
                        </TableCell>
                        <TableCell>{loanItem.sourceWing}</TableCell>
                        <TableCell>{loanItem.eventName || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {isOverdue && <span className="text-red-500 mr-1">●</span>}
                            {loanItem.expectedReturnDate ? 
                              new Date(loanItem.expectedReturnDate).toLocaleDateString() : '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            loanItem.status === 'Loaned' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {loanItem.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button asChild variant="outline">
              <Link to="/loan-items-return">
                Go to Loan Items Return
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
};

export default LoanItems;
