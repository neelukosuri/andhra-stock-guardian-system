
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { User, District, CommunicationStaff } from '@/types';

const UserManagement: React.FC = () => {
  const { 
    users, addUser, updateUser,
    districts, addDistrict, updateDistrict,
    staff, addStaff, updateStaff
  } = useData();
  const { toast } = useToast();

  // Communication Staff State
  const [newStaff, setNewStaff] = useState<Omit<CommunicationStaff, 'id' | 'createdAt' | 'updatedAt'>>({
    gNo: '',
    name: '',
    rank: '',
    placeOfPosting: '',
    mobileNumber: ''
  });
  const [editingStaff, setEditingStaff] = useState<CommunicationStaff | null>(null);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);

  // Districts State
  const [newDistrict, setNewDistrict] = useState<Omit<District, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    isCommissionerateOrWing: false
  });
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [districtDialogOpen, setDistrictDialogOpen] = useState(false);

  // Users State
  const [newUser, setNewUser] = useState<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>({
    username: '',
    password: '',
    role: 'HQ_ADMIN',
    isActive: true
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  // Staff CRUD Operations
  const handleStaffSubmit = () => {
    try {
      if (editingStaff) {
        updateStaff(editingStaff.id, {
          gNo: newStaff.gNo,
          name: newStaff.name,
          rank: newStaff.rank,
          placeOfPosting: newStaff.placeOfPosting,
          mobileNumber: newStaff.mobileNumber
        });
        toast({
          title: "Staff updated",
          description: `${newStaff.name} has been updated successfully.`
        });
      } else {
        addStaff(newStaff);
        toast({
          title: "Staff added",
          description: `${newStaff.name} has been added successfully.`
        });
      }
      resetStaffForm();
      setStaffDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error processing your request.",
        variant: "destructive"
      });
    }
  };

  const resetStaffForm = () => {
    setNewStaff({
      gNo: '',
      name: '',
      rank: '',
      placeOfPosting: '',
      mobileNumber: ''
    });
    setEditingStaff(null);
  };

  const handleEditStaff = (staff: CommunicationStaff) => {
    setEditingStaff(staff);
    setNewStaff({
      gNo: staff.gNo,
      name: staff.name,
      rank: staff.rank,
      placeOfPosting: staff.placeOfPosting,
      mobileNumber: staff.mobileNumber
    });
    setStaffDialogOpen(true);
  };

  // District CRUD Operations
  const handleDistrictSubmit = () => {
    try {
      if (editingDistrict) {
        updateDistrict(editingDistrict.id, {
          name: newDistrict.name,
          isCommissionerateOrWing: newDistrict.isCommissionerateOrWing
        });
        toast({
          title: "District updated",
          description: `${newDistrict.name} has been updated successfully.`
        });
      } else {
        addDistrict(newDistrict);
        toast({
          title: "District added",
          description: `${newDistrict.name} has been added successfully.`
        });
      }
      resetDistrictForm();
      setDistrictDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error processing your request.",
        variant: "destructive"
      });
    }
  };

  const resetDistrictForm = () => {
    setNewDistrict({
      name: '',
      isCommissionerateOrWing: false
    });
    setEditingDistrict(null);
  };

  const handleEditDistrict = (district: District) => {
    setEditingDistrict(district);
    setNewDistrict({
      name: district.name,
      isCommissionerateOrWing: district.isCommissionerateOrWing
    });
    setDistrictDialogOpen(true);
  };

  // User CRUD Operations
  const handleUserSubmit = () => {
    try {
      if (editingUser) {
        // Omit password if it's empty (user didn't want to change it)
        const userUpdate: Partial<User> = {
          username: newUser.username,
          role: newUser.role,
          isActive: newUser.isActive
        };
        
        // Only include password if it was provided
        if (newUser.password) {
          userUpdate.password = newUser.password;
        }
        
        // Only include districtId for DISTRICT_ADMIN role
        if (newUser.role === 'DISTRICT_ADMIN' && newUser.districtId) {
          userUpdate.districtId = newUser.districtId;
        } else {
          // Remove districtId for HQ_ADMIN
          userUpdate.districtId = undefined;
        }
        
        updateUser(editingUser.id, userUpdate);
        toast({
          title: "User updated",
          description: `${newUser.username} has been updated successfully.`
        });
      } else {
        // For new users, password is required
        if (!newUser.password) {
          toast({
            title: "Error",
            description: "Password is required for new users.",
            variant: "destructive"
          });
          return;
        }
        
        // Only add districtId for DISTRICT_ADMIN role
        const userData = { ...newUser };
        if (userData.role !== 'DISTRICT_ADMIN') {
          delete userData.districtId;
        }
        
        addUser(userData);
        toast({
          title: "User added",
          description: `${newUser.username} has been added successfully.`
        });
      }
      resetUserForm();
      setUserDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error processing your request.",
        variant: "destructive"
      });
    }
  };

  const resetUserForm = () => {
    setNewUser({
      username: '',
      password: '',
      role: 'HQ_ADMIN',
      isActive: true
    });
    setEditingUser(null);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      password: '', // Empty password field for security
      role: user.role,
      districtId: user.districtId,
      isActive: user.isActive
    });
    setUserDialogOpen(true);
  };

  const toggleUserStatus = (user: User) => {
    updateUser(user.id, { isActive: !user.isActive });
    toast({
      title: user.isActive ? "User deactivated" : "User activated",
      description: `${user.username} has been ${user.isActive ? "deactivated" : "activated"} successfully.`
    });
  };

  // Format date display helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <AppLayout>
      <Card className="w-full">
        <CardHeader className="bg-apBlue-50">
          <CardTitle className="text-apBlue-700">User & District Management</CardTitle>
          <CardDescription>
            Manage communication staff, districts/wings, and user accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="staff" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="staff" className="flex-1">Communication Staff</TabsTrigger>
              <TabsTrigger value="districts" className="flex-1">Districts & Wings</TabsTrigger>
              <TabsTrigger value="users" className="flex-1">User Accounts</TabsTrigger>
            </TabsList>
            
            {/* Communication Staff Tab */}
            <TabsContent value="staff">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Communication Staff Database</h3>
                <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetStaffForm}>Add New Staff</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{editingStaff ? "Edit Staff" : "Add New Staff"}</DialogTitle>
                      <DialogDescription>
                        Enter the communication staff details below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="gNo" className="text-right">G No.</Label>
                        <Input
                          id="gNo"
                          value={newStaff.gNo}
                          onChange={(e) => setNewStaff({...newStaff, gNo: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                          id="name"
                          value={newStaff.name}
                          onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="rank" className="text-right">Rank</Label>
                        <Input
                          id="rank"
                          value={newStaff.rank}
                          onChange={(e) => setNewStaff({...newStaff, rank: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="placeOfPosting" className="text-right">Place of Posting</Label>
                        <Input
                          id="placeOfPosting"
                          value={newStaff.placeOfPosting}
                          onChange={(e) => setNewStaff({...newStaff, placeOfPosting: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="mobileNumber" className="text-right">Mobile Number</Label>
                        <Input
                          id="mobileNumber"
                          value={newStaff.mobileNumber}
                          onChange={(e) => setNewStaff({...newStaff, mobileNumber: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleStaffSubmit}>
                        {editingStaff ? "Update Staff" : "Add Staff"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>G No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Rank</TableHead>
                      <TableHead>Place of Posting</TableHead>
                      <TableHead>Mobile Number</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.length > 0 ? (
                      staff.map((staffMember) => (
                        <TableRow key={staffMember.id}>
                          <TableCell className="font-medium">{staffMember.gNo}</TableCell>
                          <TableCell>{staffMember.name}</TableCell>
                          <TableCell>{staffMember.rank}</TableCell>
                          <TableCell>{staffMember.placeOfPosting}</TableCell>
                          <TableCell>{staffMember.mobileNumber}</TableCell>
                          <TableCell>{formatDate(staffMember.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditStaff(staffMember)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No staff members found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            {/* Districts & Wings Tab */}
            <TabsContent value="districts">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Districts & Special Wings</h3>
                <Dialog open={districtDialogOpen} onOpenChange={setDistrictDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetDistrictForm}>Add New District/Wing</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{editingDistrict ? "Edit District/Wing" : "Add New District/Wing"}</DialogTitle>
                      <DialogDescription>
                        Enter the district or special wing details below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                          id="name"
                          value={newDistrict.name}
                          onChange={(e) => setNewDistrict({...newDistrict, name: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <div className="flex items-center space-x-2 col-span-3">
                          <Switch
                            id="type"
                            checked={newDistrict.isCommissionerateOrWing}
                            onCheckedChange={(checked) => 
                              setNewDistrict({...newDistrict, isCommissionerateOrWing: checked})
                            }
                          />
                          <Label htmlFor="type">
                            {newDistrict.isCommissionerateOrWing ? "Commissionerate/Wing" : "District"}
                          </Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleDistrictSubmit}>
                        {editingDistrict ? "Update District/Wing" : "Add District/Wing"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {districts.length > 0 ? (
                      districts.map((district) => (
                        <TableRow key={district.id}>
                          <TableCell className="font-medium">{district.name}</TableCell>
                          <TableCell>
                            {district.isCommissionerateOrWing ? "Commissionerate/Wing" : "District"}
                          </TableCell>
                          <TableCell>{formatDate(district.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditDistrict(district)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No districts or wings found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            {/* User Accounts Tab */}
            <TabsContent value="users">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">User Accounts</h3>
                <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetUserForm}>Add New User</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
                      <DialogDescription>
                        Enter the user account details below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">Username</Label>
                        <Input
                          id="username"
                          value={newUser.username}
                          onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                          {editingUser ? "New Password (leave blank to keep current)" : "Password"}
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value: 'HQ_ADMIN' | 'DISTRICT_ADMIN') => 
                            setNewUser({...newUser, role: value})
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HQ_ADMIN">HQ Admin</SelectItem>
                            <SelectItem value="DISTRICT_ADMIN">District Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {newUser.role === 'DISTRICT_ADMIN' && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="district" className="text-right">District</Label>
                          <Select
                            value={newUser.districtId}
                            onValueChange={(value) => 
                              setNewUser({...newUser, districtId: value})
                            }
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select district" />
                            </SelectTrigger>
                            <SelectContent>
                              {districts.map(district => (
                                <SelectItem key={district.id} value={district.id}>
                                  {district.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <div className="flex items-center space-x-2 col-span-3">
                          <Switch
                            id="status"
                            checked={newUser.isActive}
                            onCheckedChange={(checked) => 
                              setNewUser({...newUser, isActive: checked})
                            }
                          />
                          <Label htmlFor="status">
                            {newUser.isActive ? "Active" : "Inactive"}
                          </Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleUserSubmit}>
                        {editingUser ? "Update User" : "Add User"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>District</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.role === 'HQ_ADMIN' ? 'HQ Admin' : 'District Admin'}</TableCell>
                          <TableCell>
                            {user.districtId ? 
                              districts.find(d => d.id === user.districtId)?.name || 'Unknown District' : 
                              'N/A'}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditUser(user)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant={user.isActive ? "destructive" : "default"} 
                                size="sm" 
                                onClick={() => toggleUserStatus(user)}
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No users found
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

export default UserManagement;
