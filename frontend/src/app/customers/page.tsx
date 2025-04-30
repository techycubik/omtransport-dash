"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  X,
  Edit,
  ArrowLeft,
  SquareArrowOutUpRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AddressAutocomplete from "@/components/AddressAutocomplete";

// Define the Customer type
interface Customer {
  id: number;
  name: string;
  gstNo?: string;
  address?: string;
  contact?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  maps_link?: string;
}

// Define the form schema
const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gstNo: z.string().optional(),
  address: z.string().optional(),
  contact: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  maps_link: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Initialize the form
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      gstNo: "",
      address: "",
      contact: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      maps_link: "",
    },
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
      console.log("Starting API request to fetch customers");

      // Try with direct Next.js API route
      const nextApiUrl = "/api/customers";
      console.log(`Fetching from Next.js API route: ${nextApiUrl}`);

      const response = await fetch(nextApiUrl);

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.error(
          `Failed to fetch customers: ${response.status} ${errorText}`
        );
        throw new Error(`Failed to fetch customers: ${response.status}`);
      }

      const data = await response.json();
      console.log("Customers fetched:", data);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError(
        `Failed to load customers. Error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (values: CustomerFormValues) => {
    try {
      console.log("Submitting form with values:", values);

      let response;

      if (editingCustomer) {
        // Update existing customer
        response = await api(`/api/customers/${editingCustomer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      } else {
        // Create new customer
        response = await api("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API response error:", errorText);

        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          throw new Error(
            errorData.error ||
              (editingCustomer
                ? "Failed to update customer"
                : "Failed to create customer")
          );
        } catch (parseError) {
          // If it's not valid JSON, use the raw text
          throw new Error(
            errorText ||
              (editingCustomer
                ? "Failed to update customer"
                : "Failed to create customer")
          );
        }
      }

      const customerData = await response.json();

      if (editingCustomer) {
        // Update the customer in the list
        setCustomers((prevCustomers) =>
          prevCustomers.map((c) =>
            c.id === editingCustomer.id ? customerData : c
          )
        );
        toast.success("Customer updated successfully");
      } else {
        // Add the new customer to the list
        setCustomers((prevCustomers) => [...prevCustomers, customerData]);
        toast.success("Customer created successfully");
      }

      setShowForm(false);
      form.reset();
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save customer"
      );
    }
  };

  // Filter customers based on search term
  const filteredCustomers =
    searchTerm.trim() === ""
      ? customers
      : customers.filter((customer) => {
          const searchLower = searchTerm.toLowerCase();
          return (
            (customer.name?.toLowerCase() || "").includes(searchLower) ||
            (customer.contact?.toLowerCase() || "").includes(searchLower) ||
            (customer.gstNo?.toLowerCase() || "").includes(searchLower) ||
            (customer.address?.toLowerCase() || "").includes(searchLower)
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

  // Add a function to handle address selection
  const handleAddressSelect = (addressData: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    maps_link?: string;
    fullAddress?: string;
  }) => {
    form.setValue("street", addressData.street || "");
    form.setValue("city", addressData.city || "");
    form.setValue("state", addressData.state || "");
    form.setValue("pincode", addressData.pincode || "");
    form.setValue("maps_link", addressData.maps_link || "");
    form.setValue("address", addressData.fullAddress || "");
  };

  // Add handleEdit function back
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    form.reset({
      name: customer.name,
      gstNo: customer.gstNo || "",
      contact: customer.contact || "",
      address: customer.address || "",
      street: customer.street || "",
      city: customer.city || "",
      state: customer.state || "",
      pincode: customer.pincode || "",
      maps_link: customer.maps_link || "",
    });
    setShowForm(true);
  };

  // Form component - use this pattern consistently across all forms
  const CustomerForm = () => (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {editingCustomer ? "Edit Customer" : "Add New Customer"}
        </h1>
        <Button
          variant="ghost"
          onClick={() => {
            setShowForm(false);
            setEditingCustomer(null);
            form.reset();
          }}
          className="mr-2 text-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1 text-gray-800" />
          Back
        </Button>
      </div>

      <Card className="p-10 bg-white border border-gray-200">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-800 font-semibold">
                    Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                      placeholder="Enter customer name"
                      {...field}
                    />
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
                  <FormLabel className="text-gray-800 font-semibold">
                    GST Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                      placeholder="Enter GST number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-2">
              <h2 className="font-medium mb-3">Address Details</h2>

              <div className="mb-4">
                <label className="font-medium mb-2 block text-gray-800">
                  Search Address
                </label>
                <AddressAutocomplete
                  onAddressSelect={handleAddressSelect}
                  defaultValue={editingCustomer?.address || ""}
                />
              </div>

              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 font-semibold">
                      Street/Location
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                        placeholder="Enter street or location"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold">
                        City
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                          placeholder="Enter city"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // If the city is changed, we assume the user wants to change it manually
                            // but we won't auto-update other fields
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold">
                        State
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                          placeholder="Enter state"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold">
                        Pincode
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                          placeholder="Enter pincode"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maps_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-semibold">
                        Google Maps Link
                      </FormLabel>
                      <FormControl>
                        <div className="flex">
                          <Input
                            placeholder="Enter Google Maps URL"
                            {...field}
                            className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                          />
                          {field.value && (
                            <a
                              href={field.value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="!text-blue-300 hover:!text-blue-600 px-1 flex items-center justify-center "
                            >
                              <SquareArrowOutUpRight className="h-5 w-5" />
                            </a>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="text-gray-800 font-semibold">
                      Full Address (Legacy)
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                        placeholder="Enter full address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-800 font-semibold">
                    Contact
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                      placeholder="Enter contact information"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Saving..."
                  : editingCustomer
                  ? "Update Customer"
                  : "Save Customer"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );

  // List component - use this pattern consistently
  const CustomerListView = () => (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 mb-4 text-red-500 bg-red-50 border border-red-200 rounded-md">
          <div className="font-medium mb-2">Error loading customers:</div>
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

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="    Search by name, contact or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className=" bg-gray-50 border-b border-gray-200 text-gray-700 "
        />
      </div>

      {/* Customers Table */}
      <Card className="bg-white border border-gray-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="w-[80px] text-gray-700 font-semibold">
                  ID
                </TableHead>
                <TableHead className="text-gray-700 font-semibold">
                  Name
                </TableHead>
                <TableHead className="text-gray-700 font-semibold">
                  GST Number
                </TableHead>
                <TableHead className="text-gray-700 font-semibold">
                  Address
                </TableHead>
                <TableHead className="text-gray-700 font-semibold">
                  Contact
                </TableHead>
                <TableHead className="text-gray-700 font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <CustomerTableSkeleton />
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-gray-600"
                  >
                    {searchTerm
                      ? "No customers match your search."
                      : "No customers found. Add your first customer to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="hover:bg-gray-50 border-b border-gray-200"
                  >
                    <TableCell className="text-gray-800">
                      {customer.id}
                    </TableCell>
                    <TableCell className="font-medium text-gray-800">
                      {customer.name}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {customer.gstNo || "-"}
                    </TableCell>
                    <TableCell>
                      {customer.street && <div>{customer.street}</div>}
                      {(customer.city ||
                        customer.state ||
                        customer.pincode) && (
                        <div>
                          <span className="font-medium">{customer.city}</span>
                          {customer.city && customer.state ? ", " : ""}
                          {customer.state} {customer.pincode}
                        </div>
                      )}
                      {!customer.street &&
                        !customer.city &&
                        !customer.state &&
                        !customer.pincode &&
                        customer.address}
                      {customer.maps_link && (
                        <a
                          href={customer.maps_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-sm block mt-1 flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          View on Maps
                        </a>
                      )}
                    </TableCell>
                    <TableCell>{customer.contact || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleEdit(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );

  // Use this consistent pattern for conditional rendering
  return (
    <AppShell pageTitle="Customers">
      <div className="relative">
        {showForm ? <CustomerForm /> : <CustomerListView />}
      </div>
    </AppShell>
  );
}
