
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { User, District, CommunicationStaff, UserRole } from '@/types';

const UserManagement: React.FC = () => {
  const { 
    users, 
    districts, 
    staff, 
    addUser, 
    updateUser, 
    addDistrict, 
    updateDistrict, 
    addStaff, 
    updateStaff 
  } = useData();
  const { toast } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState('users');

  // User form state
  const [newUser, setNewUser] = useState<{
    username: string;
    password: string;
    role: UserRole;
    districtId?: string;
  }>({
    username: '',
    password: '',
    role: 'HQ_ADMIN',
  });

  // District form state
  const [newDistrict, setNewDistrict] = useState<{
    name: string;
    isCommissionerateOrWing: boolean;
  }>({
    name: '',
    isCommissionerateOrWing: false,
  });

  // Staff form state
  const [newStaff, setNewStaff] = useState<{
    gNo: string;
    name: string;
    rank: string;
    placeOfPosting: string;
    mobileNumber: string;
  }>({
    gNo: '',
    name: '',
    rank: '',
    placeOfPosting: '',
    mobileNumber: '',
  });

  // Handle user form input changes
  const handleUserChange = (field: keyof typeof newUser, value: string | boolean) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };

  // Handle district form input changes
  const handleDistrictChange = (field: keyof typeof newDistrict, value: string | boolean) => {
    setNewDistrict(prev => ({ ...prev, [field]: value }));
  };

  // Handle staff form input changes
  const handleStaffChange = (field: keyof typeof newStaff, value: string) => {
    setNewStaff(prev => ({ ...prev, [field]: value }));
  };

  // Handle create user
  const handleCreateUser = () => {
    try {
      // Validation
      if (!newUser.username || !newUser.password) {
        toast({
          title: "Missing Fields",
          description: "Username and password are required.",
          variant: "destructive"
        });
        return;
      }

      // Check if username already exists
      if (users.some(u => u.username === newUser.username)) {
        toast({
          title: "Username Exists",
          description: "This username is already in use.",
          variant: "destructive"
        });
        return;
      }

      // Create user
      const user = addUser({
        username: newUser.username,
        password: newUser.password,
        role: newUser.role,
        districtId: newUser.role === 'DISTRICT_ADMIN' ? newUser.districtId : undefined,
        isActive: true,
      });

      toast({
        title: "User Created",
        description: `User ${user.username} has been created successfully.`
      });

      // Reset form
      setNewUser({
        username: '',
        password: '',
        role: 'HQ_ADMIN',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive"
      });
      console.error(error);
    }
  };

  // Handle create district
  const handleCreateDistrict = () => {
    try {
      // Validation
      if (!newDistrict.name) {
        toast({
          title: "Missing Fields",
          description: "District name is required.",
          variant: "destructive"
        });
        return;
      }

      // Check if district name already exists
      if (districts.some(d => d.name === newDistrict.name)) {
        toast({
          title: "District Exists",
          description: "A district with this name already exists.",
          variant: "destructive"
        });
        return;
      }

      // Create district
      const district = addDistrict({
        name: newDistrict.name,
        isCommissionerateOrWing: newDistrict.isCommissionerateOrWing,
      });

      toast({
        title: "District Created",
        description: `${district.name} has been created successfully.`
      });

      // Reset form
      setNewDistrict({
        name: '',
        isCommissionerateOrWing: false,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create district.",
        variant: "destructive"
      });
      console.error(error);
    }
  };

  // Handle create staff
  const handleCreateStaff = () => {
    try {
      // Validation
      if (!newStaff.gNo || !newStaff.name || !newStaff.rank || !newStaff.placeOfPosting) {
        toast({
          title: "Missing Fields",
          description: "G No., Name, Rank and Place of Posting are required.",
          variant: "destructive"
        });
        return;
      }

      // Check if G No. already exists
      if (staff.some(s => s.gNo === newStaff.gNo)) {
        toast({
          title: "Staff Exists",
          description: "A staff member with this G No. already exists.",
          variant: "destructive"
        });
        return;
      }

      // Create staff
      const staffMember = addStaff({
        gNo: newStaff.gNo,
        name: newStaff.name,
        rank: newStaff.rank,
        placeOfPosting: newStaff.placeOfPosting,
        mobileNumber: newStaff.mobileNumber,
      });

      toast({
        title: "Staff Created",
        description: `${staffMember.name} has been added successfully.`
      });

      // Reset form
      setNewStaff({
        gNo: '',
        name: '',
        rank: '',
        placeOfPosting: '',
        mobileNumber: '',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create staff member.",
        variant: "destructive"
      });
      console.error(error);
    }
  };

  // Toggle user active status
  const toggleUserActive = (userId: string, currentStatus: boolean) => {
    try {
      updateUser(userId, { isActive: !currentStatus });
      toast({
        title: "User Updated",
        description: `User status has been updated.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive"
      });
      console.error(error);
    }
  };

  return (
    <AppLayout>
      <Card className="w-full">
        <CardHeader className="bg-apBlue-50">
          <CardTitle className="text-apBlue-700">User Management</CardTitle>
          <CardDescription>
            Manage users, districts, and communication staff
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
              <TabsTrigger value="districts" className="flex-1">Districts & Wings</TabsTrigger>
              <TabsTrigger value="staff" className="flex-1">Communication Staff</TabsTrigger>
            </TabsList>
            
            {/* Users Tab */}
            <TabsContent value="users">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Add New User</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input 
                            id="username" 
                            value={newUser.username}
                            onChange={(e) => handleUserChange('username', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input 
                            id="password" 
                            type="password" 
                            value={newUser.password}
                            onChange={(e) => handleUserChange('password', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select 
                            value={newUser.role} 
                            onValueChange={(value) => handleUserChange('role', value as UserRole)}
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
                            <Label htmlFor="district">District/Wing</Label>
                            <Select 
                              value={newUser.districtId} 
                              onValueChange={(value) => handleUserChange('districtId', value)}
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
                        
                        <Button className="w-full" onClick={handleCreateUser}>
                          Create User
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Existing Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>District</TableHead>
                            <TableHead>Active</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => {
                            const district = districts.find(d => d.id === user.districtId);
                            
                            return (
                              <TableRow key={user.id}>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>
                                  {user.role === 'HQ_ADMIN' ? 'HQ Admin' : 'District Admin'}
                                </TableCell>
                                <TableCell>
                                  {district ? district.name : user.role === 'HQ_ADMIN' ? 'N/A' : 'Not Assigned'}
                                </TableCell>
                                <TableCell>
                                  <Switch 
                                    checked={user.isActive} 
                                    onCheckedChange={() => toggleUserActive(user.id, user.isActive)}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Districts Tab */}
            <TabsContent value="districts">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Add New District/Wing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="districtName">Name</Label>
                          <Input 
                            id="districtName" 
                            value={newDistrict.name}
                            onChange={(e) => handleDistrictChange('name', e.target.value)}
                            placeholder="e.g. Vijayawada Commissionerate"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="isCommissionerateOrWing" 
                            checked={newDistrict.isCommissionerateOrWing}
                            onCheckedChange={(checked) => handleDistrictChange('isCommissionerateOrWing', checked)}
                          />
                          <Label htmlFor="isCommissionerateOrWing">Is Commissionerate or Wing</Label>
                        </div>
                        
                        <Button className="w-full" onClick={handleCreateDistrict}>
                          Create District/Wing
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Existing Districts & Wings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {districts.map((district) => (
                            <TableRow key={district.id}>
                              <TableCell>{district.name}</TableCell>
                              <TableCell>
                                {district.isCommissionerateOrWing ? 'Commissionerate/Wing' : 'District'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Staff Tab */}
            <TabsContent value="staff">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Add New Staff Member</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="gNo">G No.</Label>
                          <Input 
                            id="gNo" 
                            value={newStaff.gNo}
                            onChange={(e) => handleStaffChange('gNo', e.target.value)}
                            placeholder="e.g. G12345"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="staffName">Name</Label>
                          <Input 
                            id="staffName" 
                            value={newStaff.name}
                            onChange={(e) => handleStaffChange('name', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="rank">Rank</Label>
                          <Input 
                            id="rank" 
                            value={newStaff.rank}
                            onChange={(e) => handleStaffChange('rank', e.target.value)}
                            placeholder="e.g. Inspector"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="placeOfPosting">Place of Posting</Label>
                          <Input 
                            id="placeOfPosting" 
                            value={newStaff.placeOfPosting}
                            onChange={(e) => handleStaffChange('placeOfPosting', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="mobileNumber">Mobile Number</Label>
                          <Input 
                            id="mobileNumber" 
                            value={newStaff.mobileNumber}
                            onChange={(e) => handleStaffChange('mobileNumber', e.target.value)}
                          />
                        </div>
                        
                        <Button className="w-full" onClick={handleCreateStaff}>
                          Add Staff Member
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Communication Staff</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>G No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Rank</TableHead>
                            <TableHead>Place of Posting</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {staff.map((staffMember) => (
                            <TableRow key={staffMember.id}>
                              <TableCell>{staffMember.gNo}</TableCell>
                              <TableCell>{staffMember.name}</TableCell>
                              <TableCell>{staffMember.rank}</TableCell>
                              <TableCell>{staffMember.placeOfPosting}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default UserManagement;
