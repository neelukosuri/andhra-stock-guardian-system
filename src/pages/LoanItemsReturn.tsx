import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const LoanItemsReturn: React.FC = () => {
  const { loanItems, items, updateLoanItem } = useData();
  const { toast } = useToast();
  
  const [selectedLoanItemId, setSelectedLoanItemId] = useState<string>('');
  const [returnDetails, setReturnDetails] = useState({
    returnedTo: '',
    returnNotes: ''
  });
  const [filteredLoanItems, setFilteredLoanItems] = useState(loanItems);
  
  // Filter to show only loaned items (not yet returned)
  useEffect(() => {
    setFilteredLoanItems(loanItems.filter(item => item.status === 'Loaned'));
  }, [loanItems]);
  
  const handleReturnDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReturnDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectLoanItem = (id: string) => {
    setSelectedLoanItemId(id);
    setReturnDetails({
      returnedTo: '',
      returnNotes: ''
    });
  };
  
  const getItemName = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.name : 'Unknown Item';
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  const handleLoanItemReturn = () => {
    if (!selectedLoanItemId) {
      toast({
        title: "No item selected",
        description: "Please select a loan item to return",
        variant: "destructive"
      });
      return;
    }
    
    if (!returnDetails.returnedTo.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter who the item was returned to",
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
      
      updateLoanItem(selectedLoanItemId, returnData);
      
      toast({
        title: "Item returned successfully",
        description: "The loan item has been marked as returned"
      });
      
      // Reset the form
      setSelectedLoanItemId('');
      setReturnDetails({
        returnedTo: '',
        returnNotes: ''
      });
    } catch (error) {
      toast({
        title: "Error returning item",
        description: "An error occurred while processing the return",
        variant: "destructive"
      });
      console.error(error);
    }
  };
  
  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader className="bg-apBlue-50">
            <CardTitle className="text-apBlue-700">Loan Items Return</CardTitle>
            <CardDescription>Process returns of items that were received on loan</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Item to Return</label>
                  <Select value={selectedLoanItemId} onValueChange={handleSelectLoanItem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a loan item" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredLoanItems.map((loanItem) => (
                        <SelectItem key={loanItem.id} value={loanItem.id}>
                          {getItemName(loanItem.itemId)} - {loanItem.sourceWing} - {formatDate(loanItem.expectedReturnDate)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedLoanItemId && (
                  <div className="space-y-4 border p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium mb-2">Returned To</label>
                      <Input
                        name="returnedTo"
                        value={returnDetails.returnedTo}
                        onChange={handleReturnDetailsChange}
                        placeholder="Enter the name of the person/department"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Return Notes</label>
                      <Textarea
                        name="returnNotes"
                        value={returnDetails.returnNotes}
                        onChange={handleReturnDetailsChange}
                        placeholder="Any additional notes about the return"
                        rows={3}
                      />
                    </div>
                    
                    <Button onClick={handleLoanItemReturn}>Process Return</Button>
                  </div>
                )}
              </div>
              
              <div>
                {selectedLoanItemId && (
                  <div className="border p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Item Details</h3>
                    {(() => {
                      const loanItem = loanItems.find(item => item.id === selectedLoanItemId);
                      if (!loanItem) return <p>Item not found</p>;
                      
                      const itemDetails = items.find(i => i.id === loanItem.itemId);
                      
                      return (
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="font-medium">Item Name:</dt>
                            <dd>{itemDetails?.name || 'Unknown'}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium">Quantity:</dt>
                            <dd>{loanItem.quantity}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium">Source:</dt>
                            <dd>{loanItem.sourceWing}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium">Event:</dt>
                            <dd>{loanItem.eventName}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="font-medium">Expected Return:</dt>
                            <dd>{formatDate(loanItem.expectedReturnDate)}</dd>
                          </div>
                        </dl>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-apBlue-50">
            <CardTitle className="text-apBlue-700">Loan Returns History</CardTitle>
            <CardDescription>View history of all loan item returns</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Expected Return</TableHead>
                  <TableHead>Actual Return</TableHead>
                  <TableHead>Returned To</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loanItems.length > 0 ? (
                  loanItems.map((loan) => (
                    <TableRow key={loan.id} className={loan.status === 'Returned' ? 'bg-green-50' : ''}>
                      <TableCell>{getItemName(loan.itemId)}</TableCell>
                      <TableCell>{loan.sourceWing}</TableCell>
                      <TableCell>{loan.eventName}</TableCell>
                      <TableCell>{formatDate(loan.expectedReturnDate)}</TableCell>
                      <TableCell>{formatDate(loan.actualReturnDate)}</TableCell>
                      <TableCell>{loan.returnedTo || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={loan.status === 'Returned' ? "outline" : "default"}
                          className={loan.status === 'Returned' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                        >
                          {loan.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">No loan items found</TableCell>
                  </TableRow>
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
