'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppShell from '@/components/AppShell';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form schema for editing users
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'STAFF']),
});

type UserFormValues = z.infer<typeof userSchema>;

type User = {
  id: number;
  email: string;
  name?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
  lastLogin?: string;
  createdAt: string;
};

export default function EditUserPage({ params }: { params: { id: string } }) {
  const { isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Initialize form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      role: 'STAFF',
    },
  });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would have an endpoint to fetch a specific user
        // For now, we'll fetch all users and find the one we want
        const response = await api('/auth/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const users = await response.json();
        const foundUser = users.find((u: User) => u.id.toString() === params.id);
        
        if (!foundUser) {
          throw new Error('User not found');
        }
        
        setUser(foundUser);
        form.setValue('name', foundUser.name || '');
        form.setValue('role', foundUser.role);
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load user');
        router.push('/dashboard/users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [params.id, form, router]);

  // Handle form submission
  const onSubmit = async (values: UserFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const response = await api(`/auth/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update user');
      }

      toast.success('User updated successfully');
      router.push('/dashboard/users');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading indicator
  if (isLoading) {
    return (
      <AppShell pageTitle="Edit User">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-t-4 border-teal-500 border-solid rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading user data...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Show error if user not found
  if (!user) {
    return (
      <AppShell pageTitle="Edit User">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <p className="text-lg text-red-600">User not found</p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/users')}
              className="mt-4"
            >
              Return to Users
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Edit User">
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit User</h1>
      </div>

      <Card className="p-6 bg-white mb-6 max-w-2xl">
        <div className="mb-6 pb-4 border-b border-gray-100">
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-base font-medium mt-1">{user.email}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="User Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      {isSuperAdmin && (
                        <>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </AppShell>
  );
} 