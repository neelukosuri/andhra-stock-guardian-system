
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast"
import { useData } from '@/contexts/DataContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { DatePicker } from "@/components/ui/date-picker"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { DistrictIssuanceVoucher, DistrictItemMovement } from '@/types';

const IssueToOffices = () => {
  const { toast } = useToast()
  const { items, staff, districts, createDistrictIssuanceVoucher, addDistrictItemMovement } = useData();

  const [officeName, setOfficeName] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [issueDate, setIssueDate] = useState<Date | undefined>(new Date());
  const [selectedItems, setSelectedItems] = useState<{ itemId: string; quantity: number; metricId: string; }[]>([]);

  const staffOptions = staff.map(staff => ({
    value: staff.gNo,
    label: `${staff.name} (${staff.gNo})`
  }));

  const ItemSchema = z.object({
    itemId: z.string().min(1, {
      message: "Please select an item.",
    }),
    quantity: z.coerce.number().min(1, {
      message: "Quantity must be greater than 0.",
    }),
    metricId: z.string().min(1, {
      message: "Please select a unit.",
    }),
  })

  const form = useForm<z.infer<typeof ItemSchema>>({
    resolver: zodResolver(ItemSchema),
    defaultValues: {
      itemId: "",
      quantity: 1,
      metricId: "",
    },
  })

  const [open, setOpen] = React.useState(false)

  const addItem = (values: z.infer<typeof ItemSchema>) => {
    const item = items.find(i => i.id === values.itemId);
    if (!item) {
      toast({
        title: "Error",
        description: "Item not found.",
        variant: "destructive",
      })
      return;
    }

    const newItem = {
      itemId: values.itemId,
      quantity: values.quantity,
      metricId: values.metricId,
    };

    setSelectedItems([...selectedItems, newItem]);
    setOpen(false);
    form.reset();
    toast({
      title: "Success",
      description: `${item.name} added to issuance list.`,
    })
  };

  const removeItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(item => item.itemId !== itemId));
  };

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add items to the issuance list.",
        variant: "destructive",
      })
      return;
    }

    if (!officeName) {
      toast({
        title: "Error",
        description: "Please enter the receiving office name.",
        variant: "destructive",
      })
      return;
    }

    if (!selectedStaff) {
      toast({
        title: "Error",
        description: "Please select the receiving staff.",
        variant: "destructive",
      })
      return;
    }

    if (!issueDate) {
      toast({
        title: "Error",
        description: "Please select the issue date.",
        variant: "destructive",
      })
      return;
    }

    createIssuanceVoucher();
  };

  const createIssuanceVoucher = async () => {
    try {
      // Create the issuance voucher first
      const newIv: Omit<DistrictIssuanceVoucher, 'id' | 'createdAt' | 'ivNumber'> = {
        issueDate: issueDate ? issueDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        issuedByUserId: 'user-1', // In a real app, this would come from auth context
        receivingStaffGNo: selectedStaff,
        receivingOfficeName: officeName,
        districtId: 'district-1', // Adding the districtId
      };

      const iv = await createDistrictIssuanceVoucher(newIv);

      // Then create the item movements
      for (const item of selectedItems) {
        const newItemMovement: Omit<DistrictItemMovement, 'id' | 'createdAt' | 'districtId' | 'isReturnable' | 'returnedQuantity'> = {
          districtIvId: iv.id,
          itemId: item.itemId,
          quantity: item.quantity,
          metricId: item.metricId,
          movementType: 'Issue_To_Internal',
        };
        await addDistrictItemMovement({ 
          ...newItemMovement, 
          districtId: 'district-1', 
          isReturnable: false, 
          returnedQuantity: 0 
        });
      }

      toast({
        title: "Success",
        description: "Issuance voucher created successfully.",
      })

      // Reset the form
      setOfficeName('');
      setSelectedStaff('');
      setIssueDate(new Date());
      setSelectedItems([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Issue Items to Internal Offices</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Issuance Details</CardTitle>
            <CardDescription>Enter the details for the item issuance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="officeName">Receiving Office Name</Label>
                <Input
                  id="officeName"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="receivingStaff">Receiving Staff</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select receiving staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffOptions.map((staff) => (
                      <SelectItem key={staff.value} value={staff.value}>
                        {staff.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Issue Date</Label>
              <DatePicker
                value={issueDate}
                onSelect={setIssueDate}
                className="border rounded-md p-2 w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items to Issue</CardTitle>
            <CardDescription>Add items to the issuance list.</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Add Item</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Item</DialogTitle>
                  <DialogDescription>
                    Add items to the issuance list.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(addItem)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="itemId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an item" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {items.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="metricId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {/* Assuming all items have the same metrics for simplicity */}
                                {items[0]?.ledgerId === 'ledger-1' ?
                                  <>
                                    <SelectItem value="number">Number</SelectItem>
                                  </>
                                  :
                                  <>
                                    <SelectItem value="meters">Meters</SelectItem>
                                    <SelectItem value="kilograms">Kilograms</SelectItem>
                                  </>
                                }
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="submit">Add to List</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedItems.map((item) => {
                  const itemName = items.find(i => i.id === item.itemId)?.name || 'Unknown Item';
                  return (
                    <TableRow key={item.itemId}>
                      <TableCell>{itemName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.metricId}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => removeItem(item.itemId)}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {selectedItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No items added yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Button onClick={handleSubmit}>Create Issuance Voucher</Button>
      </div>
    </AppLayout>
  );
};

export default IssueToOffices;
