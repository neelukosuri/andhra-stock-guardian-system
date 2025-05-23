
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Bell, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
type AlertStatus = 'new' | 'acknowledged' | 'resolved';

interface SystemAlert {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: 'inventory' | 'system' | 'security' | 'procurement';
}

const mockAlerts: SystemAlert[] = [
  {
    id: '1',
    title: 'Low stock warning',
    description: 'Radio batteries (SKU: BAT-001) stock level below threshold (5 units remaining)',
    timestamp: '2025-05-23T10:15:00Z',
    severity: 'high',
    status: 'new',
    category: 'inventory'
  },
  {
    id: '2',
    title: 'System maintenance',
    description: 'Scheduled system maintenance in 24 hours. System may be unavailable for up to 30 minutes.',
    timestamp: '2025-05-22T14:30:00Z',
    severity: 'medium',
    status: 'acknowledged',
    category: 'system'
  },
  {
    id: '3',
    title: 'Login attempt from unknown location',
    description: 'Multiple login attempts detected from unrecognized IP address (103.54.120.87)',
    timestamp: '2025-05-22T08:45:00Z',
    severity: 'critical',
    status: 'resolved',
    category: 'security'
  },
  {
    id: '4',
    title: 'Procurement request approved',
    description: 'Purchase order #PO-2025-0458 for 50 Walkie-Talkie units has been approved',
    timestamp: '2025-05-21T16:20:00Z',
    severity: 'info',
    status: 'acknowledged',
    category: 'procurement'
  },
  {
    id: '5',
    title: 'Item requisition overdue',
    description: 'Requisition #REQ-2025-112 is pending verification for more than 7 days',
    timestamp: '2025-05-20T09:10:00Z',
    severity: 'low',
    status: 'new',
    category: 'inventory'
  }
];

const getSeverityColor = (severity: AlertSeverity) => {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'info': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getSeverityIcon = (severity: AlertSeverity) => {
  switch (severity) {
    case 'critical': return <AlertCircle className="h-5 w-5 text-red-600" />;
    case 'high': return <AlertTriangle className="h-5 w-5 text-amber-600" />;
    case 'medium': return <Clock className="h-5 w-5 text-yellow-600" />;
    case 'low': return <Bell className="h-5 w-5 text-blue-600" />;
    case 'info': return <CheckCircle className="h-5 w-5 text-green-600" />;
    default: return <Bell className="h-5 w-5" />;
  }
};

const getStatusBadge = (status: AlertStatus) => {
  switch (status) {
    case 'new': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">New</Badge>;
    case 'acknowledged': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Acknowledged</Badge>;
    case 'resolved': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
    default: return null;
  }
};

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>(mockAlerts);
  
  const handleAcknowledge = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: 'acknowledged' } : alert
    ));
  };
  
  const handleResolve = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: 'resolved' } : alert
    ));
  };
  
  const getFilteredAlerts = (status: AlertStatus | 'all') => {
    return status === 'all' ? alerts : alerts.filter(alert => alert.status === status);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold">Alerts</h1>
            <p className="text-gray-600 mt-1">Manage system notifications and alerts</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-[#1A3A67]">{alerts.filter(a => a.status === 'new').length} New</Badge>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <div className="border-b">
            <TabsList className="bg-transparent w-full justify-start">
              <TabsTrigger value="all">All Alerts</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="mt-6">
            <TabsContent value="all" className="space-y-4">
              {getFilteredAlerts('all').map(alert => (
                <AlertCard 
                  key={alert.id} 
                  alert={alert}
                  onAcknowledge={handleAcknowledge}
                  onResolve={handleResolve}
                  formatDate={formatDate}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="new" className="space-y-4">
              {getFilteredAlerts('new').length > 0 ? (
                getFilteredAlerts('new').map(alert => (
                  <AlertCard 
                    key={alert.id} 
                    alert={alert} 
                    onAcknowledge={handleAcknowledge}
                    onResolve={handleResolve}
                    formatDate={formatDate}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    No new alerts
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="acknowledged" className="space-y-4">
              {getFilteredAlerts('acknowledged').length > 0 ? (
                getFilteredAlerts('acknowledged').map(alert => (
                  <AlertCard 
                    key={alert.id} 
                    alert={alert} 
                    onAcknowledge={handleAcknowledge}
                    onResolve={handleResolve}
                    formatDate={formatDate}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    No acknowledged alerts
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="resolved" className="space-y-4">
              {getFilteredAlerts('resolved').length > 0 ? (
                getFilteredAlerts('resolved').map(alert => (
                  <AlertCard 
                    key={alert.id} 
                    alert={alert} 
                    onAcknowledge={handleAcknowledge}
                    onResolve={handleResolve}
                    formatDate={formatDate}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    No resolved alerts
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
        
        <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Critical System Alert</AlertTitle>
          <AlertDescription>
            Your system has 1 critical security alert that requires immediate attention.
          </AlertDescription>
        </Alert>
      </div>
    </AppLayout>
  );
};

interface AlertCardProps {
  alert: SystemAlert;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  formatDate: (dateString: string) => string;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onAcknowledge, onResolve, formatDate }) => {
  return (
    <Card className="overflow-hidden">
      <div className={`h-1 w-full ${getSeverityColor(alert.severity)}`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            {getSeverityIcon(alert.severity)}
            <div>
              <CardTitle className="text-lg">{alert.title}</CardTitle>
              <CardDescription className="mt-1 text-sm">
                {formatDate(alert.timestamp)}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(alert.status)}
        </div>
      </CardHeader>
      <CardContent>
        <p>{alert.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div>
          <Badge variant="outline" className="bg-gray-50">{alert.category}</Badge>
        </div>
        <div className="flex gap-2">
          {alert.status !== 'acknowledged' && alert.status !== 'resolved' && (
            <Button variant="outline" size="sm" onClick={() => onAcknowledge(alert.id)}>
              Acknowledge
            </Button>
          )}
          {alert.status !== 'resolved' && (
            <Button variant="default" size="sm" onClick={() => onResolve(alert.id)}>
              Resolve
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default Alerts;
