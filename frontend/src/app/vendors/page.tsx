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
import { Plus, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AddressAutocomplete from "@/components/AddressAutocomplete";

// Define the Vendor type
interface Vendor {
  id: number;
  name: string;
  gstNo?: string;
  contact?: string;
  address?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  maps_link?: string;
}

// Define the form schema using zod
const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gstNo: z.string().min(1, "GST Number is required"),
  contact: z.string().min(1, "Contact is required"),
  address: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  maps_link: z.string().optional(),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Initialize the form
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      gstNo: "",
      contact: "",
      address: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      maps_link: "",
    },
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
      const response = await api("/api/vendors");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server error response:", errorData);
        throw new Error(
          errorData.error || errorData.message || "Failed to fetch vendors"
        );
      }

      const data = await response.json();
      console.log("Vendors fetched:", data);
      setVendors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setError(
        "Failed to load vendors. The backend service might be unavailable or there might be a database connection issue."
      );
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle editing
  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    form.reset({
      name: vendor.name,
      gstNo: vendor.gstNo || "",
      contact: vendor.contact || "",
      address: vendor.address || "",
      street: vendor.street || "",
      city: vendor.city || "",
      state: vendor.state || "",
      pincode: vendor.pincode || "",
      maps_link: vendor.maps_link || "",
    });
    setShowForm(true);
  };

  // Update onSubmit to handle both create and update
  const onSubmit = async (values: VendorFormValues) => {
    console.log("Submitting form with values:", values);
    try {
      let response;

      if (editingVendor) {
        // Update existing vendor
        response = await api(`/api/vendors/${editingVendor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      } else {
        // Create new vendor
        response = await api("/api/vendors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      }

      console.log("Response:", response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: editingVendor
            ? "Failed to update vendor"
            : "Failed to create vendor",
        }));
        throw new Error(
          errorData.error ||
            (editingVendor
              ? "Failed to update vendor"
              : "Failed to create vendor")
        );
      }

      // Get the vendor data from the response
      const vendorData = await response.json();
      console.log("Vendor data:", vendorData);

      if (editingVendor) {
        // Update the vendor in the list
        setVendors((prevVendors) =>
          prevVendors.map((v) => (v.id === editingVendor.id ? vendorData : v))
        );
        toast.success("Vendor updated successfully");
      } else {
        // Add the new vendor to the list
        setVendors((prevVendors) => [...prevVendors, vendorData]);
        toast.success("Vendor created successfully");
      }

      setShowForm(false); // Close the form
      form.reset(); // Reset form values
      setEditingVendor(null); // Clear editing state
      fetchVendors(); // Refresh the table
    } catch (error) {
      console.error("Error saving vendor:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save vendor"
      );
    }
  };

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

  // Full-screen Vendor Form
  const VendorForm = () => (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {editingVendor ? "Edit Vendor" : "Add New Vendor"}
        </h1>
        <Button
          variant="ghost"
          onClick={() => {
            setShowForm(false);
            setEditingVendor(null);
            form.reset();
          }}
          className="mr-2 text-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1 text-gray-800" />
          <span className="text-gray-800">Back</span>
        </Button>
      </div>

      <Card className="p-10 bg-white border border-gray-200">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      placeholder="Enter vendor name"
                      {...field}
                      className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="gstNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 font-semibold">
                      GST Number *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter GST number"
                        {...field}
                        className="p-3 bg-white placeholder:text-gray-400 placeholder:font-thin text-gray-800 border-gray-300"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 font-semibold">
                      Contact *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter contact information"
                        {...field}
                        className="p-3 bg-white placeholder:text-gray-400 placeholder:font-thin text-gray-800 border-gray-300"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Address Details
              </h3>

              <div className="mb-4">
                <label className="block text-gray-800 font-semibold mb-2">
                  Search Address
                </label>
                <AddressAutocomplete
                  onAddressSelect={handleAddressSelect}
                  defaultValue={editingVendor?.address || ""}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          placeholder="Enter street or location"
                          {...field}
                          className="p-3 bg-white placeholder:text-gray-400 placeholder:font-thin text-gray-800 border-gray-300"
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />

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
                          placeholder="Enter city"
                          {...field}
                          className="p-3 bg-white placeholder:text-gray-400 placeholder:font-thin text-gray-800 border-gray-300"
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                          placeholder="Enter state"
                          {...field}
                          className="p-3 bg-white placeholder:text-gray-400 placeholder:font-thin text-gray-800 border-gray-300"
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
                    </FormItem>
                  )}
                />

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
                          placeholder="Enter pincode"
                          {...field}
                          className="p-3 bg-white placeholder:text-gray-400 placeholder:font-thin text-gray-800 border-gray-300"
                        />
                      </FormControl>
                      <FormMessage className="text-red-600" />
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
                            className="p-3 bg-white text-gray-800 border-gray-300 placeholder:text-gray-400 placeholder:font-thin"
                          />
                          {field.value && (
                            <a
                              href={field.value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 flex items-center justify-center rounded-r-md"
                            >
                              Open
                            </a>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-600" />
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
                        placeholder="Enter full address"
                        {...field}
                        className="p-3 bg-white placeholder:text-gray-400 placeholder:font-thin text-gray-800 border-gray-300"
                      />
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="px-6 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                {form.formState.isSubmitting
                  ? "Saving..."
                  : editingVendor
                  ? "Update Vendor"
                  : "Save Vendor"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );

  // Vendor List View
  const VendorListView = () => (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div></div>
        <Button
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      {error && (
        <div className="p-4 text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
          <Button
            variant="link"
            className="ml-2 text-blue-600"
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
          className="border-gray-300 text-gray-800 hover:bg-gray-100"
        >
          Refresh Data
        </Button>
      </div>

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
                  Contact
                </TableHead>
                <TableHead className="text-gray-700 font-semibold">
                  Address
                </TableHead>
                <TableHead className="text-gray-700 font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell>
                      <Skeleton className="h-5 w-10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : vendors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-gray-600"
                  >
                    No vendors found. Click "Add Vendor" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                vendors.map((vendor) => (
                  <TableRow
                    key={vendor.id}
                    className="hover:bg-gray-50 border-b border-gray-200"
                  >
                    <TableCell className="text-gray-800">{vendor.id}</TableCell>
                    <TableCell className="font-medium text-gray-800">
                      {vendor.name}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {vendor.gstNo || "-"}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {vendor.contact || "-"}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {vendor.street && <div>{vendor.street}</div>}
                      {(vendor.city || vendor.state || vendor.pincode) && (
                        <div>
                          <span className="font-medium">{vendor.city}</span>
                          {vendor.city && vendor.state ? ", " : ""}
                          {vendor.state} {vendor.pincode}
                        </div>
                      )}
                      {!vendor.street &&
                        !vendor.city &&
                        !vendor.state &&
                        !vendor.pincode &&
                        vendor.address}
                      {vendor.maps_link && (
                        <a
                          href={vendor.maps_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm block mt-1 flex items-center"
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
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleEdit(vendor)}
                      >
                        Edit
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

  return (
    <AppShell pageTitle="Vendors">
      <div className="relative bg-white p-6">
        {showForm ? <VendorForm /> : <VendorListView />}
      </div>
    </AppShell>
  );
}
