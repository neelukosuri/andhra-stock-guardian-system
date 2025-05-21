
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { X, Plus } from 'lucide-react';
import { CommunicationStaff } from '@/types';

const IssueToOffices: React.FC = () => {
  const { 
    districtStock, 
    items, 
    metrics, 
    staff, 
    createDistrictIssuanceVoucher, 
    addDistrictItemMovement, 
    getStaffByGNo,
    users
  } = useData();
  const { toast } = useToast();
  
  // For demo purposes, we'll use the first district
  const districtId = 'district-1';

  // Form state
  const [gNo, setGNo] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [receivingStaff, setReceivingStaff] = useState<CommunicationStaff | null>(null);
  const [selectedItems, setSelectedItems] = useState<{
    itemId: string;
    quantity: number;
  }[]>([]);

  // Handle G No. lookup
  const handleGNoLookup = () => {
    if (!gNo) {
      toast({
        title: "Required Field",
        description: "Please enter a G No.",
        variant: "destructive"
      });
      return;
    }
    
    const foundStaff = getStaffByGNo(gNo);
    if (foundStaff) {
      setReceivingStaff(foundStaff);
      toast({
        title: "Staff Found",
        description: `${foundStaff.name}, ${foundStaff.rank}`
      });
    } else {
      setReceivingStaff(null);
      toast({
        title: "Staff Not Found",
        description: "No staff member found with that G No.",
        variant: "destructive"
      });
    }
  };

  // Add item to selection
  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { itemId: '', quantity: 1 }]);
  };

  // Remove item from selection
  const handleRemoveItem = (index: number) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
  };

  // Update selected item
  const handleItemChange = (index: number, itemId: string) => {
    const newItems = [...selectedItems];
    newItems[index].itemId = itemId;
    setSelectedItems(newItems);
  };

  // Update item quantity
  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...selectedItems];
    newItems[index].quantity = quantity;
    setSelectedItems(newItems);
  };

  // Get available quantity for an item
  const getAvailableQuantity = (itemId: string) => {
    const stock = districtStock.find(s => 
      s.districtId === districtId && s.itemId === itemId
    );
    return stock ? stock.quantity : 0;
  };

  // Get metric for an item
  const getMetricForItem = (itemId: string) => {
    const stock = districtStock.find(s => 
      s.districtId === districtId && s.itemId === itemId
    );
    return stock ? getMetricName(stock.metricId) : '';
  };

  // Get item name by ID
  const getItemName = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.name : 'Unknown Item';
  };

  // Get metric name by ID
  const getMetricName = (metricId: string) => {
    const metric = metrics.find(m => m.id === metricId);
    return metric ? metric.name : '';
  };

  // Check if item is returnable
  const isItemReturnable = (itemId: string) => {
    const stock = districtStock.find(s => 
      s.districtId === districtId && s.itemId === itemId
    );
    return stock ? stock.isReturnable : false;
  };

  // Filter items by those available in the district stock
  const availableItems = items.filter(item => 
    districtStock.some(s => s.districtId === districtId && s.itemId === item.id && s.quantity > 0)
  );

  // Submit the issuance
  const handleSubmitIssuance = () => {
    try {
      // Validate form
      if (!receivingStaff) {
        toast({
          title: "Missing Staff",
          description: "Please enter a valid G No. and verify staff details.",
          variant: "destructive"
        });
        return;
      }
      
      if (!officeName) {
        toast({
          title: "Missing Office",
          description: "Please enter an office name.",
          variant: "destructive"
        });
        return;
      }
      
      if (selectedItems.length === 0 || selectedItems.some(item => !item.itemId)) {
        toast({
          title: "Missing Items",
          description: "Please select at least one item to issue.",
          variant: "destructive"
        });
        return;
      }
      
      // Check if quantities are valid
      for (const item of selectedItems) {
        const availableQty = getAvailableQuantity(item.itemId);
        if (item.quantity <= 0 || item.quantity > availableQty) {
          toast({
            title: "Invalid Quantity",
            description: `Please enter a valid quantity for ${getItemName(item.itemId)} (Available: ${availableQty})`,
            variant: "destructive"
          });
          return;
        }
      }
      
      // Create issuance voucher
      const voucher = createDistrictIssuanceVoucher({
        ivNumber: '', // This will be generated automatically
        issueDate: new Date().toISOString(),
        issuedByUserId: users[0].id, // Using first user for demo
        receivingStaffGNo: receivingStaff.gNo,
        receivingOfficeName: officeName,
      });
      
      // Process item movements
      selectedItems.forEach(item => {
        const isReturnable = isItemReturnable(item.itemId);
        
        addDistrictItemMovement({
          districtId,
          districtIvId: voucher.id,
          itemId: item.itemId,
          quantity: item.quantity,
          movementType: 'Issue_To_Internal',
          isReturnable,
          returnedQuantity: 0
        });
      });
      
      toast({
        title: "Issuance Successful",
        description: `IV ${voucher.ivNumber} has been created.`
      });
      
      // Reset form
      setGNo('');
      setOfficeName('');
      setReceivingStaff(null);
      setSelectedItems([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while processing the issuance.",
        variant: "destructive"
      });
      console.error(error);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <Card className="w-full">
          <CardHeader className="bg-apBlue-50">
            <CardTitle className="text-apBlue-700">Issue Items to Offices</CardTitle>
            <CardDescription>
              Issue inventory items to internal offices within your district
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Receiver Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Receiver Details</h3>
                
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="g-no">G No.</Label>
                    <Input 
                      id="g-no" 
                      value={gNo} 
                      onChange={(e) => setGNo(e.target.value)} 
                      placeholder="Enter G No."
                    />
                  </div>
                  <Button onClick={handleGNoLookup}>Verify</Button>
                </div>
                
                {receivingStaff && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-apBlue-50 rounded-md">
                    <div>
                      <p className="text-sm font-medium">Name</p>
                      <p>{receivingStaff.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Rank</p>
                      <p>{receivingStaff.rank}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Place of Posting</p>
                      <p>{receivingStaff.placeOfPosting}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="office">Receiving Office</Label>
                  <Input 
                    id="office" 
                    value={officeName} 
                    onChange={(e) => setOfficeName(e.target.value)}
                    placeholder="e.g. Traffic Police Station, DSP Office"
                  />
                </div>
              </div>
              
              {/* Item Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Items to Issue</h3>
                  <Button variant="outline" onClick={handleAddItem} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {selectedItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-md">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`item-${index}`}>Item</Label>
                        <Select 
                          value={item.itemId} 
                          onValueChange={(value) => handleItemChange(index, value)}
                        >
                          <SelectTrigger id={`item-${index}`}>
                            <SelectValue placeholder="Select Item" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableItems.map((availableItem) => (
                              <SelectItem key={availableItem.id} value={availableItem.id}>
                                {availableItem.name} ({availableItem.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="w-24 space-y-2">
                        <Label htmlFor={`qty-${index}`}>Quantity</Label>
                        <Input
                          id={`qty-${index}`}
                          type="number"
                          min={1}
                          max={item.itemId ? getAvailableQuantity(item.itemId) : 1}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                        />
                      </div>
                      
                      {item.itemId && (
                        <div className="text-sm">
                          <p className="font-medium">Available: {getAvailableQuantity(item.itemId)}</p>
                          <p className="text-muted-foreground">{getMetricForItem(item.itemId)}</p>
                        </div>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveItem(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {selectedItems.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No items added. Click "Add Item" to select items to issue.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSubmitIssuance} disabled={!receivingStaff || !officeName || selectedItems.length === 0}>
                  Create Issuance Voucher
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Issuances */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Recent Issuances</CardTitle>
            <CardDescription>Recently issued items to internal offices</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IV Number</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Receiving Office</TableHead>
                  <TableHead>Receiving Staff</TableHead>
                  <TableHead>Items Issued</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* This will be populated with actual district issuance data */}
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No recent issuances
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default IssueToOffices;
