'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

// Define the Material type
interface Material {
  id: number;
  name: string;
  uom: string;
}

// Define the form schema
const materialSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  uom: z.string().min(1, 'Unit of Measurement is required')
});

type MaterialFormValues = z.infer<typeof materialSchema>;

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Initialize the form
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: '',
      uom: ''
    }
  });

  // Load materials on component mount
  useEffect(() => {
    fetchMaterials();
  }, []);

  // Function to fetch materials
  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await api('/api/materials');
      if (!response.ok) throw new Error('Failed to fetch materials');
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (values: MaterialFormValues) => {
    try {
      const response = await api('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) throw new Error('Failed to create material');
      
      toast.success('Material created successfully');
      setShowForm(false);
      form.reset();
      fetchMaterials();
    } catch (error) {
      console.error('Error creating material:', error);
      toast.error('Failed to create material');
    }
  };

  // Form overlay component
  const FormOverlay = () => (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Dark background overlay */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={() => setShowForm(false)}
      ></div>
      
      {/* Form container */}
      <div className="relative bg-white w-full max-w-xl p-6 rounded-lg shadow-lg z-50">
        <button 
          onClick={() => setShowForm(false)}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
        
        <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Material</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-800 font-medium">Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter material name" {...field} className="bg-white text-gray-800 border-gray-300 placeholder-gray-400" />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="uom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-800 font-medium">Unit of Measurement</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., kg, ton, liter" {...field} className="bg-white text-gray-800 border-gray-300 placeholder-gray-400" />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Saving...' : 'Save Material'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );

  // Render the materials list
  return (
    <AppShell pageTitle="Materials">
      <div className="relative bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Materials</h1>
          <Button 
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4" />
            Add Material
          </Button>
        </div>

        <Card className="bg-white border border-gray-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-[100px] text-gray-700 font-semibold">ID</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Name</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Unit of Measurement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-gray-600">
                      Loading materials...
                    </TableCell>
                  </TableRow>
                ) : materials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-gray-600">
                      No materials found
                    </TableCell>
                  </TableRow>
                ) : (
                  materials.map((material) => (
                    <TableRow key={material.id} className="hover:bg-gray-50 border-b border-gray-200">
                      <TableCell className="text-gray-800">{material.id}</TableCell>
                      <TableCell className="text-gray-800">{material.name}</TableCell>
                      <TableCell className="text-gray-800">{material.uom}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
        
        {/* Form overlay */}
        {showForm && <FormOverlay />}
      </div>
    </AppShell>
  );
} 