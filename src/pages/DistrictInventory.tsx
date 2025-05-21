
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DistrictStockWithDetails } from '@/types';

const DistrictInventory: React.FC = () => {
  const { 
    districts, 
    districtStock, 
    items, 
    metrics, 
    getItemById, 
    getMetricById 
  } = useData();

  const [stockWithDetails, setStockWithDetails] = useState<{
    returnables: DistrictStockWithDetails[];
    consumables: DistrictStockWithDetails[];
  }>({
    returnables: [],
    consumables: []
  });

  // For demo purposes, we'll assume the first district is the current user's district
  const currentDistrictId = districts[0]?.id || '';

  useEffect(() => {
    // Filter stock for current district and categorize
    const districtItems = districtStock.filter(
      stock => stock.districtId === currentDistrictId
    );
    
    // Enhance with item details and categorize
    const enhancedItems = districtItems.map(stock => {
      const item = getItemById(stock.itemId);
      const metric = getMetricById(stock.metricId);
      
      return {
        ...stock,
        itemName: item?.name || 'Unknown Item',
        itemCode: item?.code || 'Unknown Code',
        metricName: metric?.name || 'Unknown Metric',
        districtName: districts.find(d => d.id === stock.districtId)?.name || 'Unknown District'
      };
    });
    
    // Split into returnable and consumable items
    setStockWithDetails({
      returnables: enhancedItems.filter(item => item.isReturnable),
      consumables: enhancedItems.filter(item => !item.isReturnable)
    });
  }, [districtStock, currentDistrictId, districts, getItemById, getMetricById]);

  return (
    <AppLayout>
      <Card className="w-full">
        <CardHeader className="bg-apBlue-50">
          <CardTitle className="text-apBlue-700">District Inventory</CardTitle>
          <CardDescription>
            View and manage items in your district's inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="ledger-i" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="ledger-i" className="flex-1">Ledger-I (Returnables)</TabsTrigger>
              <TabsTrigger value="ledger-ii" className="flex-1">Ledger-II (Consumables)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ledger-i">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockWithDetails.returnables.length > 0 ? (
                      stockWithDetails.returnables.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.itemCode}</TableCell>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.metricName}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No returnable items in inventory
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="ledger-ii">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockWithDetails.consumables.length > 0 ? (
                      stockWithDetails.consumables.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.itemCode}</TableCell>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.metricName}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No consumable items in inventory
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default DistrictInventory;
