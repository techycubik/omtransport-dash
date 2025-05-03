'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { RefreshCw, Search, Plus, Edit, Trash2, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppShell from '@/components/AppShell';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DeleteConfirmation } from '@/components/DeleteConfirmation';

// Define types
type User = {
  id: number;
  email: string;
  name?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
  lastLogin?: string;
  createdAt: string;
};

// Form schema for adding/editing users
const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'STAFF']),
});

type UserFormValues = z.infer<typeof userSchema>;

// Define the main component
export default function UsersManagementPage() {
  const { isAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Initialize add form
  const addForm = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      name: '',
      role: 'STAFF',
    },
  });

  // Redirect if not admin
  useEffect(() => {
    if (isAdmin === false) {
      router.push('/dashboard');
      toast.error('Admin access required');
    }
  }, [isAdmin, router]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api('/auth/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Function to search users
  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      return fetchUsers();
    }
    
    setIsSearching(true);
    try {
      const response = await api(`/auth/users/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to search users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  // Function to add a user
  const handleAddUser = () => {
    router.push('/dashboard/users/add');
  };

  // Function to edit a user
  const handleEditUser = (user: User) => {
    router.push(`/dashboard/users/edit/${user.id}`);
  };

  // Function to delete a user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await api(`/auth/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success('User deleted successfully');
      fetchUsers(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  // Open delete dialog with selected user
  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // Get role badge styling
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <AppShell pageTitle="Users">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleAddUser}
            className="flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-white mb-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
            />
          </div>
          <Button
            variant="outline"
            onClick={searchUsers}
            disabled={isSearching}
            className="flex items-center gap-2"
          >
            <Search size={16} />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
          {searchQuery && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                fetchUsers();
              }}
              className="flex items-center gap-2"
            >
              <X size={16} />
              Clear
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-t-4 border-teal-500 border-solid rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading users...</p>
          </div>
        ) : (
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
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.name || '-'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${getRoleBadgeStyle(user.role)}
                        `}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? format(new Date(user.lastLogin), 'dd MMM yyyy HH:mm') : 'Never'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="h-8 px-2 text-xs"
                          >
                            <Edit size={14} className="mr-1" />
                            Edit
                          </Button>
                          
                          {isSuperAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteModal(user)}
                              className="h-8 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 size={14} className="mr-1" />
                              Delete
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
        )}
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Enter the details of the new user below
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddUser)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
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
                control={addForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="STAFF">Staff</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        {isSuperAdmin && (
                          <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    addForm.reset();
                    setIsAddDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteUser}
        title="Delete User"
        description="Are you sure you want to delete this user?"
        itemName={userToDelete?.email}
      />
    </AppShell>
  );
} 