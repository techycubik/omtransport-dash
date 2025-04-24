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
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Define the Vendor type
interface Vendor {
  id: number;
  name: string;
  gstNo?: string;
  contact?: string;
  address?: string;
}

// Define the form schema using zod
const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gstNo: z.string().min(1, "GST Number is required"),
  contact: z.string().min(1, "Contact is required"),
  address: z.string().optional()
});

type VendorFormValues = z.infer<typeof vendorSchema>;

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      gstNo: '',
      contact: '',
      address: ''
    }
  });

  // Load vendors on component mount
  useEffect(() => {
    fetchVendors();
  }, []);

  // Function to fetch vendors
  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api('/api/vendors');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error response:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to fetch vendors');
      }
      
      const data = await response.json();
      console.log('Vendors fetched:', data);
      setVendors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError('Failed to load vendors. The backend service might be unavailable or there might be a database connection issue.');
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (values: VendorFormValues) => {
    console.log('Submitting form with values:', values);
    try {
      const response = await api('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      console.log('Response:', response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create vendor' }));
        throw new Error(errorData.error || 'Failed to create vendor');
      }
      
      // Get the created vendor data and add it to the state
      const newVendor = await response.json();
      console.log('New vendor:', newVendor);
      setVendors(prevVendors => [...prevVendors, newVendor]);
      
      toast.success('Vendor created successfully');
      setIsSheetOpen(false);  // Close the sheet
      form.reset();  // Reset form values
    } catch (error) {
      console.error('Error creating vendor:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create vendor');
    }
  };

  return (
    <AppShell pageTitle="Vendors">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Add Vendor
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Add New Vendor</SheetTitle>
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
                          <Input placeholder="Enter vendor name" {...field} />
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
                        <FormLabel>GST Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter GST number" {...field} />
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
                        <FormLabel>Contact *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact information" {...field} />
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
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? 'Saving...' : 'Save Vendor'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Card>
        {error && (
          <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-md">
            {error}
            <Button 
              variant="link" 
              className="ml-2 text-blue-500"
              onClick={() => fetchVendors()}
            >
              Retry
            </Button>
          </div>
        )}
        <div className="mb-4 p-4 flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => fetchVendors()}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>GST Number</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  </TableRow>
                ))
              ) : vendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                    No vendors found. Click "Add Vendor" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>{vendor.id}</TableCell>
                    <TableCell>{vendor.name}</TableCell>
                    <TableCell>{vendor.gstNo || '-'}</TableCell>
                    <TableCell>{vendor.contact || '-'}</TableCell>
                    <TableCell>{vendor.address || '-'}</TableCell>
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