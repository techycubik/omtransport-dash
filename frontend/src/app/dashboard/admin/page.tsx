'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Form validation schema
const adminSchema = z.object({
  email: z.string().email('Valid email required'),
  name: z.string().min(2, 'Name must be at least 2 characters')
});

type AdminFormValues = z.infer<typeof adminSchema>;

// Admin type definition
type Admin = {
  id: number;
  email: string;
  name?: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  lastLogin?: string;
  createdAt: string;
};

// Audit log type definition
type AuditLog = {
  id: number;
  userId: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  entityType?: string;
  entityId?: number;
  changes?: object;
  ipAddress?: string;
  createdAt: string;
};

export default function AdminManagementPage() {
  const { isSuperAdmin } = useAuth();
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userActivity, setUserActivity] = useState<AuditLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Initialize form
  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      email: '',
      name: ''
    }
  });

  // Redirect if not super admin
  useEffect(() => {
    if (isSuperAdmin === false) {
      router.push('/dashboard');
      toast.error('Super admin access required');
    }
  }, [isSuperAdmin, router]);

  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  // Function to fetch admins
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await api('/auth/admins');
      if (!response.ok) {
        throw new Error('Failed to fetch admin users');
      }
      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch user activity
  const fetchUserActivity = async (userId: number) => {
    setSelectedUserId(userId);
    setActivityLoading(true);
    try {
      const response = await api(`/auth/users/${userId}/activity`);
      if (!response.ok) {
        throw new Error('Failed to fetch user activity');
      }
      const data = await response.json();
      setUserActivity(data);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      toast.error('Failed to load user activity');
    } finally {
      setActivityLoading(false);
    }
  };

  // Function to create a new admin
  const onSubmit = async (values: AdminFormValues) => {
    try {
      const response = await api('/auth/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create admin user');
      }

      // Get new admin from response
      const newAdmin = await response.json();
      
      // Add to list
      setAdmins(prevAdmins => [...prevAdmins, newAdmin]);
      
      // Reset form and close dialog
      form.reset();
      setShowAddForm(false);
      
      toast.success('Admin user created successfully');
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create admin user');
    }
  };

  // Function to deactivate a user
  const handleDeactivateUser = async (userId: number) => {
    if (!confirm('Are you sure you want to deactivate this user?')) {
      return;
    }

    try {
      const response = await api(`/auth/users/${userId}/deactivate`, {
        method: 'PUT'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to deactivate user');
      }

      // Remove from list
      setAdmins(prevAdmins => prevAdmins.filter(admin => admin.id !== userId));
      toast.success('User deactivated successfully');
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to deactivate user');
    }
  };

  // Render activity log
  const renderActivityLog = () => {
    const selectedAdmin = admins.find(admin => admin.id === selectedUserId);

    if (!selectedAdmin) {
      return null;
    }

    return (
      <Dialog open={!!selectedUserId} onOpenChange={() => setSelectedUserId(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Activity Log: {selectedAdmin.name || selectedAdmin.email}</DialogTitle>
          </DialogHeader>
          
          {activityLoading ? (
            <div className="py-8">
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : userActivity.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">No activity recorded for this user</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userActivity.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>{format(new Date(log.createdAt), 'dd MMM yyyy HH:mm:ss')}</TableCell>
                    <TableCell>
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${log.action === 'LOGIN' ? 'bg-green-100 text-green-800' : ''}
                        ${log.action === 'LOGOUT' ? 'bg-gray-100 text-gray-800' : ''}
                        ${log.action === 'CREATE' ? 'bg-blue-100 text-blue-800' : ''}
                        ${log.action === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${log.action === 'DELETE' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {log.action === 'LOGIN' && <CheckCircle size={12} className="mr-1" />}
                        {log.action === 'LOGOUT' && <XCircle size={12} className="mr-1" />}
                        {log.action === 'CREATE' && <Plus size={12} className="mr-1" />}
                        {log.action === 'UPDATE' && <RefreshCw size={12} className="mr-1" />}
                        {log.action === 'DELETE' && <AlertTriangle size={12} className="mr-1" />}
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell>
                      {log.entityType ? `${log.entityType} #${log.entityId}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {log.changes ? (
                        <pre className="text-xs whitespace-pre-wrap">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>{log.ipAddress || 'Unknown'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  // Render add admin form
  const renderAddAdminForm = () => (
    <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Admin User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating...' : 'Create Admin'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  return (
    <AppShell pageTitle="Admin Management">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin User Management</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchAdmins}
            className="flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add Admin
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`loading-${i}`}>
                    <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No admin users found
                  </TableCell>
                </TableRow>
              ) : (
                admins.map(admin => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.id}</TableCell>
                    <TableCell>{admin.name || '-'}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${admin.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}
                      `}>
                        {admin.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {admin.lastLogin ? format(new Date(admin.lastLogin), 'dd MMM yyyy HH:mm') : 'Never'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(admin.createdAt), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchUserActivity(admin.id)}
                          className="h-8 px-2 text-xs"
                        >
                          <Clock size={14} className="mr-1" />
                          Activity
                        </Button>
                        
                        {admin.role !== 'SUPER_ADMIN' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeactivateUser(admin.id)}
                            className="h-8 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <XCircle size={14} className="mr-1" />
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {renderActivityLog()}
      {renderAddAdminForm()}
    </AppShell>
  );
} 