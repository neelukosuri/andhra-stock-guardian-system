
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const LarFromOffices: React.FC = () => {
  const { 
    districtIssuanceVouchers, 
    districtItemMovements, 
    items,
    metrics,
    users,
    staff,
    createDistrictLARVoucher,
    addDistrictItemMovement
  } = useData();
  const { toast } = useToast();
  
  // For demo purposes, we'll use the first district
  const districtId = 'district-1';

  const [selectedIV, setSelectedIV] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<{
    id: string;
    itemId: string;
    quantity: number;
    maxQuantity: number;
  }[]>([]);

  // Fetch issuable items when IV is selected
  const handleIVSelect = (ivNumber: string) => {
    setSelectedIV(ivNumber);
    setSelectedItems([]);

    const ivFound = districtIssuanceVouchers.find(iv => iv.ivNumber === ivNumber);
    if (ivFound) {
      // Find movements for this IV that are returnable and have unreturned quantity
      const movementsForIV = districtItemMovements.filter(
        m => m.districtIvId === ivFound.id && m.isReturnable && m.quantity > m.returnedQuantity
      );

      const itemsToReturn = movementsForIV.map(m => ({
        id: m.id,
        itemId: m.itemId,
        quantity: 0,
        maxQuantity: m.quantity - m.returnedQuantity
      }));

      setSelectedItems(itemsToReturn);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (index: number, value: string) => {
    const quantity = parseInt(value, 10) || 0;
    const newItems = [...selectedItems];
    
    // Ensure quantity doesn't exceed max allowed
    newItems[index].quantity = Math.min(quantity, newItems[index].maxQuantity);
    
    setSelectedItems(newItems);
  };

  // Create LAR voucher
  const handleCreateLAR = () => {
    try {
      // Get IV details
      const ivDetails = districtIssuanceVouchers.find(iv => iv.ivNumber === selectedIV);
      if (!ivDetails) return;

      // Validate at least one item is being returned
      if (!selectedItems.some(item => item.quantity > 0)) {
        toast({
          title: "No items selected",
          description: "Please select at least one item to return",
          variant: "destructive"
        });
        return;
      }

      // Create LAR voucher
      const larVoucher = createDistrictLARVoucher({
        returnDate: new Date().toISOString(),
        returnedByUserId: users[0].id, // Using first user for demo
        districtIvIdRef: ivDetails.id
      });

      // Process item movements for each item
      selectedItems.forEach(item => {
        if (item.quantity > 0) {
          addDistrictItemMovement({
            districtId,
            districtLarId: larVoucher.id,
            itemId: item.itemId,
            quantity: item.quantity,
            movementType: 'Return_From_Internal',
            isReturnable: true,
            returnedQuantity: 0
          });
        }
      });

      toast({
        title: "LAR Created Successfully",
        description: `LAR ${larVoucher.larNumber} has been created.`,
      });

      // Reset form
      setSelectedIV('');
      setSelectedItems([]);
    } catch (error) {
      toast({
        title: "Error Creating LAR",
        description: "There was a problem processing your request.",
        variant: "destructive"
      });
      console.error(error);
    }
  };

  // Get item name by ID
  const getItemName = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.name : 'Unknown Item';
  };

  // Get metric name by ID
  const getMetricName = (itemId: string) => {
    // Find this item in district movements to get the metric
    const movement = districtItemMovements.find(m => m.itemId === itemId);
    if (!movement) return '';
    
    const stock = movement.metricId ? { metricId: movement.metricId } : null; 
    if (!stock) return '';
    
    const metric = metrics.find(m => m.id === stock.metricId);
    return metric ? metric.name : '';
  };

  // Get office name from IV
  const getOfficeName = (ivNumber: string) => {
    const iv = districtIssuanceVouchers.find(iv => iv.ivNumber === ivNumber);
    return iv ? iv.receivingOfficeName : 'Unknown Office';
  };

  // Get staff name by G-Number
  const getStaffName = (gNo: string) => {
    const staffMember = staff.find(s => s.gNo === gNo);
    return staffMember ? staffMember.name : 'Unknown Staff';
  };

  // Filter issuance vouchers to show only those for the current district with returnable items
  const relevantIVs = districtIssuanceVouchers.filter(iv => {
    const hasReturnableItems = districtItemMovements.some(
      m => m.districtIvId === iv.id && m.isReturnable && m.quantity > m.returnedQuantity
    );
    return hasReturnableItems;
  });

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <Card className="w-full">
          <CardHeader className="bg-apBlue-50">
            <CardTitle className="text-apBlue-700">LAR from Offices</CardTitle>
            <CardDescription>
              Process returns of items from internal offices back to district stores
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6">
              {/* IV Selection */}
              <div className="space-y-2">
                <Label htmlFor="iv-number">IV Number</Label>
                <Select value={selectedIV} onValueChange={handleIVSelect}>
                  <SelectTrigger id="iv-number">
                    <SelectValue placeholder="Select IV Number" />
                  </SelectTrigger>
                  <SelectContent>
                    {relevantIVs.map((iv) => (
                      <SelectItem key={iv.id} value={iv.ivNumber}>
                        {iv.ivNumber} - {iv.receivingOfficeName} - {getStaffName(iv.receivingStaffGNo)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Display returnable items from the selected IV */}
              {selectedIV && selectedItems.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Returnable Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Original Quantity</TableHead>
                        <TableHead>Already Returned</TableHead>
                        <TableHead>Available to Return</TableHead>
                        <TableHead>Return Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedItems.map((item, index) => {
                        // Find original movement
                        const originalMovement = districtItemMovements.find(m => m.id === item.id);
                        
                        return (
                          <TableRow key={item.id}>
                            <TableCell>{getItemName(item.itemId)}</TableCell>
                            <TableCell>{originalMovement?.quantity} {getMetricName(item.itemId)}</TableCell>
                            <TableCell>{originalMovement?.returnedQuantity} {getMetricName(item.itemId)}</TableCell>
                            <TableCell>{item.maxQuantity} {getMetricName(item.itemId)}</TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                min={0} 
                                max={item.maxQuantity}
                                value={item.quantity} 
                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                className="w-20"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Create LAR Button */}
              {selectedIV && selectedItems.length > 0 && (
                <div className="flex justify-end">
                  <Button onClick={handleCreateLAR}>Create LAR Voucher</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* History of LAR Vouchers */}
        <Card className="w-full">
          <CardHeader className="bg-apBlue-50">
            <CardTitle className="text-apBlue-700">LAR History</CardTitle>
            <CardDescription>
              View history of previously created LAR vouchers
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>LAR Number</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Original IV</TableHead>
                  <TableHead>Office</TableHead>
                  <TableHead>Items Returned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No LAR history found
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

export default LarFromOffices;
