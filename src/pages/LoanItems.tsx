import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useData } from '@/contexts/DataContext';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { LoanItem } from '@/types';
import { useToast } from "@/hooks/use-toast"

const LoanItems = () => {
  const { items, metrics, loanItems, addLoanItem } = useData();
  const [form, setForm] = useState({
    quantity: 1,
    expectedReturnDate: new Date(),
    itemId: '',
    metricId: '',
    sourceWing: '',
    eventName: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast()

  useEffect(() => {
    if (items.length > 0 && metrics.length > 0) {
      setForm(prev => ({
        ...prev,
        itemId: items[0].id,
        metricId: metrics[0].id,
      }));
    }
  }, [items, metrics]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setForm(prev => ({
        ...prev,
        expectedReturnDate: date,
      }));
    }
  };

  const createLoanItem = async () => {
    try {
      const newLoanItem = {
        quantity: form.quantity,
        expectedReturnDate: form.expectedReturnDate.toISOString().split('T')[0],
        itemId: form.itemId,
        metricId: form.metricId,
        sourceWing: form.sourceWing,
        eventName: form.eventName,
        createdAt: new Date().toISOString()
      };

      await addLoanItem(newLoanItem);
      toast({
        title: "Success",
        description: "Loan Item created successfully.",
      })
      // Reset the form
      setForm({
        quantity: 1,
        expectedReturnDate: new Date(),
        itemId: items[0].id,
        metricId: metrics[0].id,
        sourceWing: '',
        eventName: '',
      });
    } catch (error) {
      console.error("Error creating loan item:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create loan item.",
      })
    }
  };

  const getItemName = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.name : 'Unknown Item';
  };

  const getMetricName = (metricId: string) => {
    const metric = metrics.find(m => m.id === metricId);
    return metric ? metric.name : 'Unknown Unit';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredLoanItems = loanItems.filter(loan => {
    const itemName = getItemName(loan.itemId);
    return itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.sourceWing.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.eventName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Loan Items Management</h1>
          <p className="text-muted-foreground">
            Manage items issued on loan for various events or purposes.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Loan Item</CardTitle>
            <CardDescription>
              Record details of items being issued on loan.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemId">Item</Label>
                <Select value={form.itemId} onValueChange={(value) => setForm(prev => ({ ...prev, itemId: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map(item => (
                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="metricId">Unit</Label>
                <Select value={form.metricId} onValueChange={(value) => setForm(prev => ({ ...prev, metricId: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {metrics.map(metric => (
                      <SelectItem key={metric.id} value={metric.id}>{metric.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="expectedReturnDate">Expected Return Date</Label>
                <DatePicker
                  name="expectedReturnDate"
                  value={form.expectedReturnDate}
                  onChange={handleDateChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sourceWing">Source Wing</Label>
                <Input
                  type="text"
                  id="sourceWing"
                  name="sourceWing"
                  value={form.sourceWing}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  type="text"
                  id="eventName"
                  name="eventName"
                  value={form.eventName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <Button onClick={createLoanItem}>Add Loan Item</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loaned Items</CardTitle>
            <CardDescription>
              List of all items currently out on loan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Source Wing</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Expected Return</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoanItems.map(loan => (
                  <TableRow key={loan.id}>
                    <TableCell>{getItemName(loan.itemId)}</TableCell>
                    <TableCell>{loan.sourceWing}</TableCell>
                    <TableCell>{loan.eventName}</TableCell>
                    <TableCell>{formatDate(loan.expectedReturnDate)}</TableCell>
                    <TableCell>{loan.status}</TableCell>
                  </TableRow>
                ))}
                {filteredLoanItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">No loan items found.</TableCell>
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

export default LoanItems;
