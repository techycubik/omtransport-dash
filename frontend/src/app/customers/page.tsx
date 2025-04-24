'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Define the Customer type
interface Customer {
  id: number;
  name: string;
  gstNo?: string;
  address?: string;
  contact?: string;
}

// Define the form schema using zod
const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gstNo: z.string().optional().transform(val => val === '' ? undefined : val),
  address: z.string().optional().transform(val => val === '' ? undefined : val),
  contact: z.string().optional().transform(val => val === '' ? undefined : val)
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize the form
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      gstNo: '',
      address: '',
      contact: ''
    }
  });

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Function to fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Starting API request to fetch customers');
      
      // Try with direct Next.js API route
      const nextApiUrl = '/api/customers';
      console.log(`Fetching from Next.js API route: ${nextApiUrl}`);
      
      const response = await fetch(nextApiUrl);
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`Failed to fetch customers: ${response.status} ${errorText}`);
        throw new Error(`Failed to fetch customers: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Customers fetched:', data);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError(`Failed to load customers. Error: ${error instanceof Error ? error.message : String(error)}`);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (values: CustomerFormValues) => {
    try {
      console.log('Submitting form with values:', values);
      
      const response = await api('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', errorText);
        
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Failed to create customer');
        } catch (parseError) {
          // If it's not valid JSON, use the raw text
          throw new Error(errorText || 'Failed to create customer');
        }
      }
      
      const newCustomer = await response.json();
      setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
      
      toast.success('Customer created successfully');
      setIsSheetOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create customer');
    }
  };

  // Filter customers based on search term
  const filteredCustomers = searchTerm.trim() === '' 
    ? customers 
    : customers.filter(customer => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (customer.name?.toLowerCase() || '').includes(searchLower) ||
          (customer.contact?.toLowerCase() || '').includes(searchLower) ||
          (customer.gstNo?.toLowerCase() || '').includes(searchLower) ||
          (customer.address?.toLowerCase() || '').includes(searchLower)
        );
      });

  // Customer table skeleton
  const CustomerTableSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );

  return (
    <AppShell pageTitle="Customers">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-900">Customers</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="primary" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Add New Customer</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter customer name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gstNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GST Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter GST number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact information" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end pt-4">
                    <Button type="submit" variant="primary" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Saving...' : 'Save Customer'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Search bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search by name, contact, GST..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 mb-4 text-red-500 bg-red-50 border border-red-200 rounded-md">
          <div className="font-medium mb-2">Error loading customer data:</div>
          <p>{error}</p>
          <Button 
            variant="link" 
            className="mt-3 text-blue-500"
            onClick={() => fetchCustomers()}
          >
            Retry
          </Button>
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>GST Number</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <CustomerTableSkeleton />
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                    {searchTerm.trim() !== '' 
                      ? 'No customers match your search.' 
                      : 'No customers found. Click "Add Customer" to create one.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.id}</TableCell>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.gstNo || '-'}</TableCell>
                    <TableCell>{customer.address || '-'}</TableCell>
                    <TableCell>{customer.contact || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </AppShell>
  );
} 