
import React, { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const UserManagement = () => {
  const { users, districts, staff, addUser, updateUser } = useData();
  const { toast } = useToast();
  
  const [newUser, setNewUser] = useState({
    username: '',
    role: 'DISTRICT_ADMIN' as 'HQ_ADMIN' | 'DISTRICT_ADMIN',
    districtId: '',
    password: '', // In a real app, we'd handle this more securely
    isActive: true
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setNewUser(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.username || !newUser.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (newUser.role === 'DISTRICT_ADMIN' && !newUser.districtId) {
      toast({
        title: "Missing District",
        description: "Please select a district for the District Admin user",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // In a real app, we'd have proper authentication and password handling
      const userToAdd = {
        ...newUser,
        districtId: newUser.role === 'HQ_ADMIN' ? undefined : newUser.districtId
      };
      
      addUser(userToAdd);
      
      toast({
        title: "User Created Successfully",
        description: `User ${newUser.username} has been created`
      });
      
      // Reset form and close dialog
      setNewUser({
        username: '',
        role: 'DISTRICT_ADMIN',
        districtId: '',
        password: '',
        isActive: true
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error Creating User",
        description: "An error occurred while creating the user",
        variant: "destructive"
      });
      console.error(error);
    }
  };
  
  const handleToggleActive = (userId: string, currentStatus: boolean) => {
    try {
      updateUser(userId, { isActive: !currentStatus });
      
      toast({
        title: "User Status Updated",
        description: `User status has been set to ${currentStatus ? 'inactive' : 'active'}`
      });
    } catch (error) {
      toast({
        title: "Error Updating User",
        description: "An error occurred while updating the user status",
        variant: "destructive"
      });
      console.error(error);
    }
  };
  
  const getDistrictName = (districtId?: string) => {
    if (!districtId) return 'N/A';
    const district = districts.find(d => d.id === districtId);
    return district ? district.name : 'Unknown District';
  };
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>Add New User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new user account
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">Username</label>
                  <Input
                    id="username"
                    name="username"
                    value={newUser.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">Role</label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => handleSelectChange('role', value)}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HQ_ADMIN">HQ Admin</SelectItem>
                      <SelectItem value="DISTRICT_ADMIN">District Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newUser.role === 'DISTRICT_ADMIN' && (
                  <div className="space-y-2">
                    <label htmlFor="district" className="text-sm font-medium">District</label>
                    <Select
                      value={newUser.districtId}
                      onValueChange={(value) => handleSelectChange('districtId', value)}
                    >
                      <SelectTrigger id="district">
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district.id} value={district.id}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <DialogFooter>
                  <Button type="submit">Create User</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader className="bg-apBlue-50">
            <CardTitle className="text-apBlue-700">Manage Users</CardTitle>
            <CardDescription>
              Create and manage user accounts for HQ and District admins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{getDistrictName(user.districtId)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "default" : "outline"}
                        className={user.isActive ? "bg-green-100 text-green-800" : "text-gray-500"}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-apBlue-50">
            <CardTitle className="text-apBlue-700">Communication Staff</CardTitle>
            <CardDescription>
              View registered communication staff members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>G Number</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Place of Posting</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((staffMember) => (
                  <TableRow key={staffMember.id}>
                    <TableCell>{staffMember.name}</TableCell>
                    <TableCell>{staffMember.gNo}</TableCell>
                    <TableCell>{staffMember.rank}</TableCell>
                    <TableCell>{staffMember.placeOfPosting}</TableCell>
                  </TableRow>
                ))}
                {staff.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No staff members found
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

export default UserManagement;
