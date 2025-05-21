
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

// Issue Items to Internal Offices component
const IssueToOffices: React.FC = () => {
  const {
    items,
    districtStock,
    staff,
    users,
    metrics,
    createDistrictIssuanceVoucher,
    addDistrictItemMovement,
    getStaffByGNo,
    getItemById,
    getMetricById,
  } = useData();
  const { toast } = useToast();

  // For demo purposes, we'll use district-1
  const districtId = 'district-1';

  // State
  const [staffGNo, setStaffGNo] = useState('');
  const [staffDetails, setStaffDetails] = useState<any>(null);
  const [officeName, setOfficeName] = useState('');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [availableStock, setAvailableStock] = useState<any[]>([]);
  const [issuedVouchers, setIssuedVouchers] = useState<any[]>([]);

  // Office options
  const officeOptions = [
    'Commissioner Office', 
    'DCP Office', 
    'ACP Office', 
    'Police Station', 
    'Traffic Police Station',
    'Law & Order Wing',
    'Crime Wing',
    'Special Branch',
    'Admin Office'
  ];

  // Load district stock on component mount
  useEffect(() => {
    // Filter stock for the current district and transform for display
    const stockItems = districtStock
      .filter(stock => stock.districtId === districtId && stock.quantity > 0)
      .map(stock => {
        const item = getItemById(stock.itemId);
        const metric = getMetricById(stock.metricId);
        
        return {
          id: stock.id,
          itemId: stock.itemId,
          itemName: item?.name || 'Unknown Item',
          itemCode: item?.code || 'Unknown Code',
          quantity: stock.quantity,
          metricName: metric?.name || 'Unit',
          isReturnable: stock.isReturnable,
          selected: false,
          issueQuantity: 0
        };
      });
    
    setAvailableStock(stockItems);
  }, [districtStock, districtId, getItemById, getMetricById]);

  // Handle staff G No. lookup
  const handleStaffLookup = () => {
    const staffMember = getStaffByGNo(staffGNo);
    if (staffMember) {
      setStaffDetails(staffMember);
      toast({
        title: "Staff Found",
        description: `${staffMember.name}, ${staffMember.rank}`,
      });
    } else {
      setStaffDetails(null);
      toast({
        title: "Staff Not Found",
        description: "No staff member found with this G No.",
        variant: "destructive",
      });
    }
  };

  // Toggle item selection
  const handleItemToggle = (stockId: string) => {
    setAvailableStock(prev => prev.map(item => 
      item.id === stockId ? { ...item, selected: !item.selected, issueQuantity: !item.selected ? 1 : 0 } : item
    ));
    
    updateSelectedItems();
  };

  // Update quantity to issue
  const handleQuantityChange = (stockId: string, value: number) => {
    setAvailableStock(prev => prev.map(item => {
      if (item.id === stockId) {
        // Ensure quantity doesn't exceed available stock
        const newQuantity = Math.min(Math.max(0, value), item.quantity);
        return { ...item, issueQuantity: newQuantity };
      }
      return item;
    }));
    
    updateSelectedItems();
  };

  // Update selected items list based on available stock selections
  const updateSelectedItems = () => {
    const items = availableStock
      .filter(item => item.selected && item.issueQuantity > 0)
      .map(item => ({
        stockId: item.id,
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.issueQuantity,
        metricName: item.metricName,
        isReturnable: item.isReturnable
      }));
    
    setSelectedItems(items);
  };

  // Handle form submission to create IV
  const handleCreateIV = () => {
    try {
      // Validate inputs
      if (!staffDetails) {
        toast({
          title: "Staff Details Required",
          description: "Please lookup a valid staff member first.",
          variant: "destructive",
        });
        return;
      }
      
      if (!officeName) {
        toast({
          title: "Office Required",
          description: "Please select a receiving office.",
          variant: "destructive",
        });
        return;
      }
      
      if (selectedItems.length === 0) {
        toast({
          title: "No Items Selected",
          description: "Please select at least one item to issue.",
          variant: "destructive",
        });
        return;
      }
      
      // Create issuance voucher
      const ivData = {
        issueDate: new Date().toISOString(),
        issuedByUserId: users[0].id, // Using first user for demo
        receivingStaffGNo: staffGNo,
        receivingOfficeName: officeName
      };
      
      const voucher = createDistrictIssuanceVoucher(ivData);
      
      // Create item movements for each selected item
      selectedItems.forEach(item => {
        addDistrictItemMovement({
          districtId: districtId,
          districtIvId: voucher.id,
          itemId: item.itemId,
          quantity: item.quantity,
          movementType: 'Issue_To_Internal',
          isReturnable: item.isReturnable,
          returnedQuantity: 0
        });
      });
      
      // Successful issuance
      toast({
        title: "Issuance Successful",
        description: `IV ${voucher.ivNumber} has been created.`,
      });
      
      // Reset form
      setStaffGNo('');
      setStaffDetails(null);
      setOfficeName('');
      setSelectedItems([]);
      setAvailableStock(prev => prev.map(item => ({ ...item, selected: false, issueQuantity: 0 })));
      
    } catch (error) {
      console.error('Error creating IV:', error);
      toast({
        title: "Error Creating IV",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <Card className="w-full">
          <CardHeader className="bg-apBlue-50">
            <CardTitle className="text-apBlue-700">Issue to Internal Offices</CardTitle>
            <CardDescription>
              Issue items from district store to internal offices
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6">
              {/* Staff Lookup */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="g-no">Staff G No.</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="g-no" 
                      value={staffGNo} 
                      onChange={(e) => setStaffGNo(e.target.value)} 
                      placeholder="Enter G No."
                    />
                    <Button type="button" onClick={handleStaffLookup}>Lookup</Button>
                  </div>
                </div>

                {staffDetails && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Name: {staffDetails.name}</p>
                    <p className="text-sm">Rank: {staffDetails.rank}</p>
                    <p className="text-sm">Place of Posting: {staffDetails.placeOfPosting}</p>
                    <p className="text-sm">Mobile: {staffDetails.mobileNumber}</p>
                  </div>
                )}
              </div>

              {/* Office Selection */}
              <div className="space-y-2">
                <Label htmlFor="office">Receiving Office</Label>
                <Select value={officeName} onValueChange={setOfficeName}>
                  <SelectTrigger id="office">
                    <SelectValue placeholder="Select office" />
                  </SelectTrigger>
                  <SelectContent>
                    {officeOptions.map((office) => (
                      <SelectItem key={office} value={office}>{office}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Available Items */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Available Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Available Quantity</TableHead>
                      <TableHead>Quantity to Issue</TableHead>
                      <TableHead>Returnable</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableStock.length > 0 ? (
                      availableStock.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox 
                              checked={item.selected} 
                              onCheckedChange={() => handleItemToggle(item.id)} 
                            />
                          </TableCell>
                          <TableCell>{item.itemCode}</TableCell>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.quantity} {item.metricName}</TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              min={0}
                              max={item.quantity}
                              value={item.issueQuantity} 
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                              disabled={!item.selected}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>{item.isReturnable ? 'Yes' : 'No'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">No items available in stock</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Selected Items Summary */}
              {selectedItems.length > 0 && (
                <div className="space-y-2 mt-6">
                  <h3 className="text-lg font-medium">Items to Issue</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Returnable</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedItems.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.quantity} {item.metricName}</TableCell>
                          <TableCell>{item.isReturnable ? 'Yes' : 'No'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Create IV Button */}
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleCreateIV} 
                  disabled={!staffDetails || !officeName || selectedItems.length === 0}
                >
                  Create Issuance Voucher
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issued Vouchers History */}
        <Card className="w-full">
          <CardHeader className="bg-apBlue-50">
            <CardTitle className="text-apBlue-700">Issuance History</CardTitle>
            <CardDescription>
              View history of previously issued items to internal offices
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
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
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">No issuance history found</TableCell>
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
