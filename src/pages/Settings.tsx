
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Shield, User, Bell, Database, Security, Palette } from 'lucide-react';

interface SettingsProps {
  user?: { id: string; username: string; role: string };
  onLogout?: () => void;
}

const Settings = ({ user, onLogout }: SettingsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [userSettings, setUserSettings] = useState({
    username: user?.username || '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    emailNotifications: true,
    systemAlerts: false,
    lowStockThreshold: 10,
    autoLogoutMinutes: 30
  });

  const handleUserSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Settings Updated",
        description: "Your user settings have been saved successfully.",
      });
      setLoading(false);
    }, 1000);
  };

  const handleSystemSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "System Settings Updated",
        description: "System configuration has been saved successfully.",
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <AppLayout onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-[#1A3A67]" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account and system preferences</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>System</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Security className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUserSettingsSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={userSettings.username}
                        onChange={(e) => setUserSettings({...userSettings, username: e.target.value})}
                        placeholder="Enter username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userSettings.email}
                        onChange={(e) => setUserSettings({...userSettings, email: e.target.value})}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={userSettings.currentPassword}
                          onChange={(e) => setUserSettings({...userSettings, currentPassword: e.target.value})}
                          placeholder="Current password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={userSettings.newPassword}
                          onChange={(e) => setUserSettings({...userSettings, newPassword: e.target.value})}
                          placeholder="New password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={userSettings.confirmPassword}
                          onChange={(e) => setUserSettings({...userSettings, confirmPassword: e.target.value})}
                          placeholder="Confirm password"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={loading} className="bg-[#1A3A67] hover:bg-[#1A3A67]/90">
                    {loading ? 'Saving...' : 'Save Profile Settings'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={systemSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setSystemSettings({...systemSettings, emailNotifications: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Alerts</Label>
                    <p className="text-sm text-gray-600">Critical system notifications</p>
                  </div>
                  <Switch
                    checked={systemSettings.systemAlerts}
                    onCheckedChange={(checked) => 
                      setSystemSettings({...systemSettings, systemAlerts: checked})
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Alert Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    min="1"
                    max="100"
                    value={systemSettings.lowStockThreshold}
                    onChange={(e) => 
                      setSystemSettings({...systemSettings, lowStockThreshold: parseInt(e.target.value) || 10})
                    }
                  />
                  <p className="text-sm text-gray-600">Alert when stock falls below this number</p>
                </div>
                
                <Button 
                  onClick={() => {
                    toast({
                      title: "Notification Settings Updated",
                      description: "Your notification preferences have been saved.",
                    });
                  }}
                  className="bg-[#1A3A67] hover:bg-[#1A3A67]/90"
                >
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>
                  Manage system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSystemSettingsSubmit} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Backup</Label>
                      <p className="text-sm text-gray-600">Enable daily automatic backups</p>
                    </div>
                    <Switch
                      checked={systemSettings.autoBackup}
                      onCheckedChange={(checked) => 
                        setSystemSettings({...systemSettings, autoBackup: checked})
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="autoLogout">Auto Logout (minutes)</Label>
                    <Input
                      id="autoLogout"
                      type="number"
                      min="5"
                      max="480"
                      value={systemSettings.autoLogoutMinutes}
                      onChange={(e) => 
                        setSystemSettings({...systemSettings, autoLogoutMinutes: parseInt(e.target.value) || 30})
                      }
                    />
                    <p className="text-sm text-gray-600">Automatically log out after inactivity</p>
                  </div>
                  
                  <Button type="submit" disabled={loading} className="bg-[#1A3A67] hover:bg-[#1A3A67]/90">
                    {loading ? 'Saving...' : 'Save System Settings'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage security and access control settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                    <h4 className="font-medium text-yellow-800">Two-Factor Authentication</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline" className="mt-2">
                      Enable 2FA
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Active Sessions</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage your active login sessions
                    </p>
                    <Button variant="outline" className="mt-2">
                      View Sessions
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Login History</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Review recent login activity
                    </p>
                    <Button variant="outline" className="mt-2">
                      View History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
