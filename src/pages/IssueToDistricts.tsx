
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { SendHorizontal, UserCheck, Building, Search, Plus, Trash } from 'lucide-react';

interface SelectedItem {
  itemId: string;
  quantity: number;
  name?: string;
  code?: string;
  isReturnable: boolean;
}

const IssueToDistricts = () => {
  const { 
    items, 
    districts, 
    hqStock, 
    staff,
    getItemById,
    getStaffByGNo,
    getDistrictById,
    createHQIssuanceVoucher,
    addHQItemMovement
  } = useData();
  
  const { toast } = useToast();
  
  // State for IV form
  const [issuanceForm, setIssuanceForm] = useState({
    receivingGNo: '',
    districtId: '',
    approvalAuthority: '',
    approvalDate: new Date().toISOString().split('T')[0],
    approvalRefNo: '',
  });
  
  // State for the staff details
  const [staffDetails, setStaffDetails] = useState<{
    name: string;
    rank: string;
    placeOfPosting: string;
  } | null>(null);
  
  // State for selected items
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  
  // State for item selection
  const [itemSelection, setItemSelection] = useState({
    itemId: '',
    quantity: 1,
    isReturnable: true
  });
  
  // State for alert dialog
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  // Filter out items that don't have any stock
  const availableItems = items.filter(item => {
    const stockItem = hqStock.find(s => s.itemId === item.id);
    return stockItem && stockItem.quantity > 0;
  });
  
  // Get the stock quantity for the selected item in the dropdown
  const getAvailableQuantity = (itemId: string) => {
    const stockItem = hqStock.find(s => s.itemId === itemId);
    return stockItem ? stockItem.quantity : 0;
  };
  
  // Handle staff GNo search
  const handleGNoSearch = () => {
    if (!issuanceForm.receivingGNo.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid G No.",
        variant: "destructive"
      });
      return;
    }
    
    const staffMember = getStaffByGNo(issuanceForm.receivingGNo);
    
    if (staffMember) {
      setStaffDetails({
        name: staffMember.name,
        rank: staffMember.rank,
        placeOfPosting: staffMember.placeOfPosting
      });
      
      toast({
        title: "Staff Found",
        description: `Found staff member: ${staffMember.name}, ${staffMember.rank}`
      });
    } else {
      setStaffDetails(null);
      toast({
        title: "Not Found",
        description: "No staff member found with the provided G No.",
        variant: "destructive"
      });
    }
  };
  
  // Handle adding an item to the issuance
  const handleAddItem = () => {
    if (!itemSelection.itemId) {
      toast({
        title: "Validation Error",
        description: "Please select an item.",
        variant: "destructive"
      });
      return;
    }
    
    const availableQuantity = getAvailableQuantity(itemSelection.itemId);
    
    if (itemSelection.quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    if (itemSelection.quantity > availableQuantity) {
      toast({
        title: "Validation Error",
        description: `Only ${availableQuantity} units available in stock.`,
        variant: "destructive"
      });
      return;
    }
    
    // Check if the item is already in the selected items list
    const existingItemIndex = selectedItems.findIndex(i => i.itemId === itemSelection.itemId);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity += itemSelection.quantity;
      setSelectedItems(updatedItems);
    } else {
      // Add new item
      const item = getItemById(itemSelection.itemId);
      setSelectedItems([
        ...selectedItems, 
        {
          itemId: itemSelection.itemId,
          quantity: itemSelection.quantity,
          name: item?.name,
          code: item?.code,
          isReturnable: itemSelection.isReturnable
        }
      ]);
    }
    
    // Reset item selection
    setItemSelection({
      itemId: '',
      quantity: 1,
      isReturnable: true
    });
    
    toast({
      title: "Item Added",
      description: "Item added to issuance list."
    });
  };
  
  // Handle removing an item from the issuance
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...selectedItems];
    updatedItems.splice(index, 1);
    setSelectedItems(updatedItems);
    
    toast({
      title: "Item Removed",
      description: "Item removed from issuance list."
    });
  };
  
  // Validate the form before submission
  const validateForm = () => {
    if (!staffDetails) {
      toast({
        title: "Validation Error",
        description: "Please search for a valid G No. first.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!issuanceForm.districtId) {
      toast({
        title: "Validation Error",
        description: "Please select a district/wing.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!issuanceForm.approvalAuthority.trim()) {
      toast({
        title: "Validation Error",
        description: "Approval authority is required.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!issuanceForm.approvalDate) {
      toast({
        title: "Validation Error",
        description: "Approval date is required.",
        variant: "destructive"
      });
      return false;
    }
    
    if (selectedItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item to issue.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  // Handle issuance submission
  const handleSubmitIssuance = () => {
    if (!validateForm()) {
      return;
    }
    
    setIsAlertOpen(true);
  };
  
  // Process the issuance after confirmation
  const processIssuance = () => {
    try {
      // Create the issuance voucher
      const voucher = createHQIssuanceVoucher({
        issueDate: new Date().toISOString(),
        issuedByUserId: 'user-1', // Default to HQ admin for this demo
        receivingStaffGNo: issuanceForm.receivingGNo,
        receivingDistrictId: issuanceForm.districtId,
        approvalAuthority: issuanceForm.approvalAuthority,
        approvalDate: issuanceForm.approvalDate,
        approvalRefNo: issuanceForm.approvalRefNo || `Ref-${Date.now().toString().slice(-6)}`
      });
      
      // Add item movements for each selected item
      selectedItems.forEach(item => {
        addHQItemMovement({
          ivId: voucher.id,
          itemId: item.itemId,
          quantity: item.quantity,
          movementType: 'Issue_To_District',
          isReturnable: item.isReturnable,
          returnedQuantity: 0
        });
      });
      
      const district = getDistrictById(issuanceForm.districtId);
      
      toast({
        title: "Issuance Created",
        description: `IV ${voucher.ivNumber} created successfully for ${district?.name}.`
      });
      
      // Reset form
      setIssuanceForm({
        receivingGNo: '',
        districtId: '',
        approvalAuthority: '',
        approvalDate: new Date().toISOString().split('T')[0],
        approvalRefNo: '',
      });
      setStaffDetails(null);
      setSelectedItems([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create issuance. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-semibold">Issue to Districts</h1>
          <p className="text-apGray-600 mt-1">Create issuance vouchers for districts and special wings.</p>
        </div>
        
        <Card className="ap-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <SendHorizontal className="mr-2 h-5 w-5 text-apBlue-600" />
              New Issuance Voucher (IV)
            </CardTitle>
            <CardDescription>
              Create a new issuance voucher for transferring items from HQ to districts or special wings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Receiver Information */}
            <div className="border-b border-gray-100 pb-6">
              <h3 className="font-medium mb-4">Receiver Information</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label htmlFor="receivingGNo" className="block text-sm font-medium text-gray-700">G No. *</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <Input 
                        id="receivingGNo" 
                        placeholder="Enter G No." 
                        value={issuanceForm.receivingGNo}
                        onChange={e => setIssuanceForm({...issuanceForm, receivingGNo: e.target.value})}
                        className="ap-input rounded-r-none"
                      />
                      <Button 
                        type="button" 
                        onClick={handleGNoSearch}
                        className="rounded-l-none border border-l-0 border-apGray-300 bg-apGray-100 hover:bg-apGray-200"
                      >
                        <Search className="h-4 w-4" />
                        <span className="ml-1">Search</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700">District/Wing *</label>
                    <Select 
                      value={issuanceForm.districtId} 
                      onValueChange={value => setIssuanceForm({...issuanceForm, districtId: value})}
                    >
                      <SelectTrigger className="ap-input">
                        <SelectValue placeholder="Select district/wing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Commissionerates</SelectLabel>
                          {districts.filter(d => d.isCommissionerateOrWing).map(district => (
                            <SelectItem key={district.id} value={district.id}>
                              {district.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Districts</SelectLabel>
                          {districts.filter(d => !d.isCommissionerateOrWing).map(district => (
                            <SelectItem key={district.id} value={district.id}>
                              {district.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {staffDetails && (
                  <div className="bg-apGray-50 p-4 rounded-lg border border-apGray-200 flex items-center">
                    <UserCheck className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium">{staffDetails.name}</p>
                      <p className="text-sm text-apGray-600">
                        {staffDetails.rank} • {staffDetails.placeOfPosting}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Approval Information */}
            <div className="border-b border-gray-100 pb-6">
              <h3 className="font-medium mb-4">Approval Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="approvalAuthority" className="block text-sm font-medium text-gray-700">Approval Authority *</label>
                  <Input 
                    id="approvalAuthority" 
                    placeholder="e.g., ADPC/IGP TS" 
                    value={issuanceForm.approvalAuthority}
                    onChange={e => setIssuanceForm({...issuanceForm, approvalAuthority: e.target.value})}
                    className="ap-input mt-1"
                  />
                </div>
                
                <div>
                  <label htmlFor="approvalDate" className="block text-sm font-medium text-gray-700">Approval Date *</label>
                  <Input 
                    id="approvalDate" 
                    type="date" 
                    value={issuanceForm.approvalDate}
                    onChange={e => setIssuanceForm({...issuanceForm, approvalDate: e.target.value})}
                    className="ap-input mt-1"
                  />
                </div>
                
                <div>
                  <label htmlFor="approvalRefNo" className="block text-sm font-medium text-gray-700">Approval Ref. No.</label>
                  <Input 
                    id="approvalRefNo" 
                    placeholder="Optional reference number" 
                    value={issuanceForm.approvalRefNo}
                    onChange={e => setIssuanceForm({...issuanceForm, approvalRefNo: e.target.value})}
                    className="ap-input mt-1"
                  />
                </div>
              </div>
            </div>
            
            {/* Item Selection */}
            <div>
              <h3 className="font-medium mb-4">Item Selection</h3>
              
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label htmlFor="item" className="block text-sm font-medium text-gray-700">Item *</label>
                  <Select 
                    value={itemSelection.itemId} 
                    onValueChange={value => setItemSelection({...itemSelection, itemId: value})}
                  >
                    <SelectTrigger className="ap-input">
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.length === 0 ? (
                        <div className="p-2 text-center text-apGray-500">No items in stock</div>
                      ) : (
                        <SelectGroup>
                          <SelectLabel>Available Items</SelectLabel>
                          {availableItems.map(item => {
                            const stockQuantity = getAvailableQuantity(item.id);
                            return (
                              <SelectItem key={item.id} value={item.id}>
                                {item.code} - {item.name} ({stockQuantity} in stock)
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-32">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity *</label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    placeholder="Qty" 
                    value={itemSelection.quantity || ''}
                    onChange={e => setItemSelection({
                      ...itemSelection, 
                      quantity: parseInt(e.target.value) || 0
                    })}
                    className="ap-input"
                    min={1}
                    max={getAvailableQuantity(itemSelection.itemId)}
                  />
                </div>
                
                <div className="w-full md:w-44">
                  <label htmlFor="returnable" className="block text-sm font-medium text-gray-700">Item Type *</label>
                  <Select 
                    value={itemSelection.isReturnable ? 'returnable' : 'nonreturnable'} 
                    onValueChange={value => setItemSelection({
                      ...itemSelection, 
                      isReturnable: value === 'returnable'
                    })}
                  >
                    <SelectTrigger className="ap-input">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="returnable">Returnable</SelectItem>
                      <SelectItem value="nonreturnable">Consumable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="self-end">
                  <Button 
                    type="button" 
                    onClick={handleAddItem}
                    className="ap-button-primary w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
              
              {/* Selected Items Table */}
              <Table>
                <TableCaption>Items to be issued in this voucher.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                        No items added to this issuance yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.code}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell>
                          {item.isReturnable ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Returnable</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200">Consumable</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveItem(index)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="button" 
              onClick={handleSubmitIssuance}
              className="ap-button-primary"
              disabled={selectedItems.length === 0}
            >
              <SendHorizontal className="h-4 w-4 mr-2" />
              Create Issuance Voucher
            </Button>
          </CardFooter>
        </Card>
        
        {/* Confirmation Dialog */}
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Issuance</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to issue these items? This action will create an IV and update the inventory.
                <div className="mt-4 p-3 bg-apGray-50 rounded-md">
                  <div className="flex items-center mb-2">
                    <UserCheck className="h-4 w-4 text-apGray-600 mr-2" />
                    <p className="font-medium">{staffDetails?.name}</p>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-apGray-600 mr-2" />
                    <p>{getDistrictById(issuanceForm.districtId)?.name}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-apGray-600">{selectedItems.length} items selected for issuance</p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={processIssuance}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default IssueToDistricts;
