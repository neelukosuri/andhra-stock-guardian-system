
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

const LarFromDistricts: React.FC = () => {
  const { 
    hqIssuanceVouchers, 
    hqItemMovements, 
    hqLarVouchers,
    items,
    metrics,
    districts, 
    users,
    staff,
    createHQLARVoucher,
    addHQItemMovement
  } = useData();
  const { toast } = useToast();

  const [selectedIV, setSelectedIV] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<{
    id: string;
    itemId: string;
    quantity: number;
    maxQuantity: number;
  }[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(); 
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);

  // Populate the LAR history with combined data
  useEffect(() => {
    const history = hqLarVouchers.map(larVoucher => {
      const originalIv = hqIssuanceVouchers.find(iv => iv.id === larVoucher.ivIdRef);
      const district = originalIv ? districts.find(d => d.id === originalIv.receivingDistrictId) : null;
      
      // Get movements associated with this LAR
      const movements = hqItemMovements.filter(m => m.larId === larVoucher.id);
      
      // Count items and calculate total quantity
      const itemCount = movements.length;
      const totalQuantity = movements.reduce((sum, m) => sum + m.quantity, 0);
      
      return {
        ...larVoucher,
        originalIvNumber: originalIv?.ivNumber || 'Unknown',
        districtName: district?.name || 'Unknown',
        itemCount,
        totalQuantity
      };
    });

    // Apply date filter if set
    let filtered = history;
    if (dateRange?.from) {
      filtered = filtered.filter(lar => {
        const larDate = new Date(lar.returnDate);
        if (dateRange.from && dateRange.to) {
          return larDate >= dateRange.from && larDate <= dateRange.to;
        } else if (dateRange.from) {
          return larDate >= dateRange.from;
        }
        return true;
      });
    }

    setFilteredHistory(filtered);
  }, [hqLarVouchers, hqIssuanceVouchers, districts, hqItemMovements, dateRange]);

  // Fetch issuable items when IV is selected
  const handleIVSelect = (ivNumber: string) => {
    setSelectedIV(ivNumber);
    setSelectedItems([]);

    const ivFound = hqIssuanceVouchers.find(iv => iv.ivNumber === ivNumber);
    if (ivFound) {
      // Find movements for this IV that are returnable and have unreturned quantity
      const movementsForIV = hqItemMovements.filter(
        m => m.ivId === ivFound.id && m.isReturnable && m.quantity > m.returnedQuantity
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
      const ivDetails = hqIssuanceVouchers.find(iv => iv.ivNumber === selectedIV);
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
      const larVoucher = createHQLARVoucher({
        returnDate: new Date().toISOString(),
        returnedByUserId: users[0].id, // Using first user for demo
        ivIdRef: ivDetails.id
      });

      // Process item movements for each item
      selectedItems.forEach(item => {
        if (item.quantity > 0) {
          addHQItemMovement({
            larId: larVoucher.id,
            itemId: item.itemId,
            quantity: item.quantity,
            movementType: 'Return_From_District',
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
    // First find the HQ stock entry for this item to get the metric
    const stockItem = hqItemMovements.find(m => m.itemId === itemId);
    if (!stockItem) return '';
    
    // Find the corresponding metric
    const metric = metrics.find(m => m.id === stockItem.metricId);
    return metric ? metric.name : '';
  };

  // Get district name by ID
  const getDistrictName = (districtId: string) => {
    const district = districts.find(d => d.id === districtId);
    return district ? district.name : 'Unknown District';
  };

  // Get staff name by G-Number
  const getStaffName = (gNo: string) => {
    const staffMember = staff.find(s => s.gNo === gNo);
    return staffMember ? staffMember.name : 'Unknown Staff';
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <Card className="w-full">
          <CardHeader className="bg-apBlue-50">
            <CardTitle className="text-apBlue-700">LAR from Districts</CardTitle>
            <CardDescription>
              Process returns of items from districts to HQ
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
                    {hqIssuanceVouchers.map((iv) => (
                      <SelectItem key={iv.id} value={iv.ivNumber}>
                        {iv.ivNumber} - {getDistrictName(iv.receivingDistrictId)} - {getStaffName(iv.receivingStaffGNo)}
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
                        const originalMovement = hqItemMovements.find(m => m.id === item.id);
                        
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
            <div className="mb-6">
              <Label className="mb-2 block">Filter by date range</Label>
              <DatePickerWithRange value={dateRange} onChange={setDateRange} className="w-[300px]" />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>LAR Number</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Original IV</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Items Returned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((lar) => (
                    <TableRow key={lar.id}>
                      <TableCell className="font-medium">{lar.larNumber}</TableCell>
                      <TableCell>{new Date(lar.returnDate).toLocaleDateString()}</TableCell>
                      <TableCell>{lar.originalIvNumber}</TableCell>
                      <TableCell>{lar.districtName}</TableCell>
                      <TableCell>{lar.itemCount} items, {lar.totalQuantity} units</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No LAR history found
                    </TableCell>
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

export default LarFromDistricts;
