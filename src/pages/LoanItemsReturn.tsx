
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { SearchIcon, ArrowLeft, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const LoanItemsReturn = () => {
  const {
    loanItems,
    updateLoanItem,
    getItemById,
    getMetricById
  } = useData();
  
  const { toast } = useToast();
  
  // State for loan item return form
  const [returnDetails, setReturnDetails] = useState({
    returnedTo: '',
    returnNotes: ''
  });
  
  // State for filtering and tracking active loan items
  const [searchTerm, setSearchTerm] = useState('');
  const [activeLoanItems, setActiveLoanItems] = useState<any[]>([]);
  
  // Update filtered items when loanItems changes
  useEffect(() => {
    const filtered = loanItems.filter(loanItem => {
      // Only show active loan items (not returned)
      if (loanItem.status !== 'Loaned') return false;
      
      const item = getItemById(loanItem.itemId);
      if (!item) return false;
      
      return (
        searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loanItem.sourceWing.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    
    setActiveLoanItems(filtered);
  }, [loanItems, searchTerm, getItemById]);
  
  // Handler for marking loan item as returned
  const handleMarkAsReturned = (id: string) => {
    if (!returnDetails.returnedTo.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter who the item was returned to.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const returnData = {
        status: 'Returned' as 'Loaned' | 'Returned',
        actualReturnDate: new Date().toISOString(),
        returnedTo: returnDetails.returnedTo,
        returnNotes: returnDetails.returnNotes
      };
      
      const updatedLoanItem = updateLoanItem(id, returnData);
      const item = getItemById(updatedLoanItem?.itemId || '');
      
      toast({
        title: "Success",
        description: `${item?.name} marked as returned to ${returnDetails.returnedTo}.`,
      });
      
      // Reset return details
      setReturnDetails({
        returnedTo: '',
        returnNotes: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update loan item status. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-semibold">Loan Item Returns</h1>
          <p className="text-apGray-600 mt-1">Process returns for items received on loan from other departments or agencies.</p>
        </div>
        
        {/* Return Details Form */}
        <Card className="ap-card">
          <CardHeader>
            <CardTitle>Return Details</CardTitle>
            <CardDescription>Enter information about who is receiving the returned items.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="returnedTo" className="block text-sm font-medium text-gray-700">Returned To *</label>
                <Input 
                  id="returnedTo" 
                  placeholder="Enter person or department receiving the return" 
                  value={returnDetails.returnedTo}
                  onChange={e => setReturnDetails({...returnDetails, returnedTo: e.target.value})}
                  className="ap-input"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="returnNotes" className="block text-sm font-medium text-gray-700">Return Notes</label>
                <Input 
                  id="returnNotes" 
                  placeholder="Any additional notes about the return" 
                  value={returnDetails.returnNotes}
                  onChange={e => setReturnDetails({...returnDetails, returnNotes: e.target.value})}
                  className="ap-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Loan Items Table */}
        <Card className="ap-card">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Active Loan Items</CardTitle>
                <CardDescription>Items currently on loan that can be returned.</CardDescription>
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
              <TableCaption>List of active loan items that can be returned.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Source Wing</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Loan Date</TableHead>
                  <TableHead>Expected Return</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeLoanItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                      {searchTerm ? 'No active loan items matching your search.' : 'No active loan items found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  activeLoanItems.map(loanItem => {
                    const item = getItemById(loanItem.itemId);
                    const metric = getMetricById(loanItem.metricId);
                    const isOverdue = new Date(loanItem.expectedReturnDate) < new Date();
                    
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
                          {loanItem.created_at ? 
                            new Date(loanItem.created_at).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {isOverdue && <span className="text-red-500 mr-1">●</span>}
                            {loanItem.expectedReturnDate ? 
                              new Date(loanItem.expectedReturnDate).toLocaleDateString() : '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            className="h-9 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleMarkAsReturned(loanItem.id)}
                            disabled={!returnDetails.returnedTo}
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Mark Returned
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Returned Items History */}
        <Card className="ap-card">
          <CardHeader>
            <CardTitle>Return History</CardTitle>
            <CardDescription>History of all items that have been returned.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Complete history of loan item returns.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Source Wing</TableHead>
                  <TableHead>Returned To</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loanItems.filter(item => item.status === 'Returned').length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      No loan items have been returned yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  loanItems
                    .filter(item => item.status === 'Returned')
                    .map(loanItem => {
                      const item = getItemById(loanItem.itemId);
                      const metric = getMetricById(loanItem.metricId);
                      
                      return (
                        <TableRow key={loanItem.id}>
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
                          <TableCell>{loanItem.returnedTo || '-'}</TableCell>
                          <TableCell>
                            {loanItem.actualReturnDate ? 
                              new Date(loanItem.actualReturnDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>{loanItem.returnNotes || '-'}</TableCell>
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

export default LoanItemsReturn;
