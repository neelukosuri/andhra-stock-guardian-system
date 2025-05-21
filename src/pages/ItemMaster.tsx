
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
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { SearchIcon, PencilIcon, TrashIcon, PlusCircleIcon } from 'lucide-react';

const ItemMaster = () => {
  const { 
    items, 
    ledgers, 
    addItem, 
    updateItem, 
    deleteItem, 
    getLedgerById 
  } = useData();
  
  const { toast } = useToast();
  
  // State for item form
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    ledgerId: '',
  });
  
  // State for ledger form
  const [newLedger, setNewLedger] = useState({
    name: '',
    currentSequenceNumber: 0,
  });
  
  // State for search/filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  // Update filtered items when items or search term changes
  useEffect(() => {
    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [items, searchTerm]);
  
  // Handler for adding new items
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.name.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Item name is required.",
        variant: "destructive" 
      });
      return;
    }
    
    if (!newItem.ledgerId) {
      toast({ 
        title: "Validation Error", 
        description: "Ledger selection is required.",
        variant: "destructive" 
      });
      return;
    }
    
    try {
      const item = addItem(newItem);
      
      toast({
        title: "Success",
        description: `Item ${item.name} (${item.code}) added successfully.`,
      });
      
      // Reset the form
      setNewItem({
        name: '',
        description: '',
        ledgerId: '',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add the item. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handler for deleting items
  const handleDeleteItem = (id: string, name: string, code: string) => {
    try {
      deleteItem(id);
      toast({
        title: "Item Deleted",
        description: `Item ${name} (${code}) has been deleted.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the item. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-semibold">Item Master</h1>
          <p className="text-apGray-600 mt-1">Manage your inventory items and ledgers.</p>
        </div>
        
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="ledgers">Ledgers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="items" className="space-y-6 mt-6">
            {/* Add New Item Form */}
            <Card className="ap-card">
              <CardHeader>
                <CardTitle>Add New Item</CardTitle>
                <CardDescription>Create a new item in the inventory master catalog.</CardDescription>
              </CardHeader>
              <form onSubmit={handleAddItem}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">Item Name *</label>
                      <Input 
                        id="itemName" 
                        placeholder="Enter item name" 
                        value={newItem.name}
                        onChange={e => setNewItem({...newItem, name: e.target.value})}
                        className="ap-input"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="ledger" className="block text-sm font-medium text-gray-700">Ledger *</label>
                      <Select 
                        value={newItem.ledgerId} 
                        onValueChange={value => setNewItem({...newItem, ledgerId: value})}
                      >
                        <SelectTrigger className="ap-input">
                          <SelectValue placeholder="Select ledger" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Available Ledgers</SelectLabel>
                            {ledgers.map((ledger) => (
                              <SelectItem key={ledger.id} value={ledger.id}>
                                {ledger.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <Input 
                      id="description" 
                      placeholder="Enter item description" 
                      value={newItem.description}
                      onChange={e => setNewItem({...newItem, description: e.target.value})}
                      className="ap-input"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="ap-button-primary">
                    <PlusCircleIcon className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            {/* Items Table */}
            <Card className="ap-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Inventory Items</CardTitle>
                    <CardDescription>All items in the master catalog.</CardDescription>
                  </div>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      className="pl-9 ap-input w-full md:w-64"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>A list of all inventory items.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Ledger</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          {searchTerm ? 'No items matching your search.' : 'No items have been added yet.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.code}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{getLedgerById(item.ledgerId)?.name}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <PencilIcon className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:border-red-300"
                              onClick={() => handleDeleteItem(item.id, item.name, item.code)}
                            >
                              <TrashIcon className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ledgers" className="mt-6">
            <Card className="ap-card">
              <CardHeader>
                <CardTitle>Manage Ledgers</CardTitle>
                <CardDescription>Ledgers are used to categorize inventory items.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>A list of all available ledgers.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ledger Name</TableHead>
                      <TableHead>Current Sequence</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgers.map(ledger => (
                      <TableRow key={ledger.id}>
                        <TableCell className="font-medium">{ledger.name}</TableCell>
                        <TableCell>{ledger.currentSequenceNumber}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <PencilIcon className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ItemMaster;
