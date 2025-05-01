"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import AppShell from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Search, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

// Define types
interface Material {
  id: number;
  name: string;
  uom: string;
}

interface Vendor {
  id: number;
  name: string;
  contact?: string;
  address?: string;
  gstNo?: string;
}

interface PurchaseOrder {
  id: number;
  vendorId: number;
  materialId: number;
  qty: number;
  rate: number;
  status: "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
  orderDate: string;
  createdAt?: string;
  updatedAt?: string;
  Vendor?: Vendor;
  Material?: Material;
}

// Define the form schema
const formSchema = z.object({
  vendorId: z.coerce.number().positive("Please select a vendor"),
  materialId: z.coerce.number().positive("Please select a material"),
  qty: z.coerce.number().positive("Quantity must be positive"),
  rate: z.coerce.number().positive("Rate must be positive"),
  status: z.enum(["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"]),
  orderDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
  address: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

type FormValues = z.infer<typeof formSchema>;

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editRow, setEditRow] = useState<PurchaseOrder | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendorId: 0,
      materialId: 0,
      qty: 0,
      rate: 0,
      status: "PENDING",
      orderDate: format(new Date(), "yyyy-MM-dd"),
      address: "",
    },
  });

  // Fetch purchases, vendors and materials
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch purchases
        const purchasesResponse = await api("/api/purchases");
        if (!purchasesResponse.ok) {
          const errorText = await purchasesResponse
            .text()
            .catch(() => "Unknown error");
          console.error(
            `Failed to fetch purchases: ${purchasesResponse.status} ${errorText}`
          );
          throw new Error(
            `Failed to fetch purchases: ${purchasesResponse.status}`
          );
        }
        const purchasesData = await purchasesResponse.json();
        setPurchases(purchasesData);

        // Fetch vendors
        const vendorsResponse = await api("/api/vendors");
        if (!vendorsResponse.ok) {
          const errorText = await vendorsResponse
            .text()
            .catch(() => "Unknown error");
          console.error(
            `Failed to fetch vendors: ${vendorsResponse.status} ${errorText}`
          );
          throw new Error(`Failed to fetch vendors: ${vendorsResponse.status}`);
        }
        const vendorsData = await vendorsResponse.json();
        setVendors(vendorsData);

        // Fetch materials
        const materialsResponse = await api("/api/materials");
        if (!materialsResponse.ok) {
          const errorText = await materialsResponse
            .text()
            .catch(() => "Unknown error");
          console.error(
            `Failed to fetch materials: ${materialsResponse.status} ${errorText}`
          );
          throw new Error(
            `Failed to fetch materials: ${materialsResponse.status}`
          );
        }
        const materialsData = await materialsResponse.json();
        setMaterials(materialsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load data. Please try again later.";

        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset form when editing row changes
  useEffect(() => {
    if (editRow) {
      form.reset({
        vendorId: editRow.vendorId,
        materialId: editRow.materialId,
        qty: editRow.qty,
        rate: editRow.rate,
        status: editRow.status,
        orderDate: editRow.orderDate
          ? format(new Date(editRow.orderDate), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        address: editRow.Vendor?.address || "",
      });
    } else {
      form.reset({
        vendorId: 0,
        materialId: 0,
        qty: 0,
        rate: 0,
        status: "PENDING",
        orderDate: format(new Date(), "yyyy-MM-dd"),
        address: "",
      });
    }
  }, [editRow, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      // Log the form values for debugging
      console.log("Form values:", values);

      // Remove address field since it's not in the database model
      const { address, ...apiValues } = values;

      // Format date as ISO string
      const formattedValues = {
        ...apiValues,
        orderDate: new Date(values.orderDate).toISOString(),
      };

      console.log("Formatted values for API:", formattedValues);

      let response;

      if (editRow) {
        // Update existing purchase order
        response = await api(`/api/purchases/${editRow.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedValues),
        });
      } else {
        // Create new purchase order
        response = await api("/api/purchases", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedValues),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API response error:", errorText);

        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Failed to save purchase order");
        } catch (parseError) {
          // If it's not valid JSON, use the raw text
          throw new Error(errorText || "Failed to save purchase order");
        }
      }

      const updatedPurchase = await response.json();

      // Add vendor and material details to the response
      const vendor = vendors.find((v) => v.id === updatedPurchase.vendorId);
      const material = materials.find(
        (m) => m.id === updatedPurchase.materialId
      );

      const enhancedPurchase = {
        ...updatedPurchase,
        Vendor: vendor,
        Material: material,
      };

      // Update the purchases list
      if (editRow) {
        setPurchases((prevPurchases) =>
          prevPurchases.map((p) =>
            p.id === enhancedPurchase.id ? enhancedPurchase : p
          )
        );
      } else {
        setPurchases((prevPurchases) => [...prevPurchases, enhancedPurchase]);
      }

      toast.success(
        editRow
          ? "Purchase order updated successfully"
          : "Purchase order created successfully"
      );
      setShowForm(false);
      form.reset();
      setEditRow(null);
    } catch (error) {
      console.error("Error saving purchase order:", error);
      // Log more detailed error information
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      toast.error(
        error instanceof Error ? error.message : "Failed to save purchase order"
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await api(`/api/purchases/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Failed to delete purchase order: ${errorText}`);
      }

      // Remove from state
      setPurchases((prevPurchases) => prevPurchases.filter((p) => p.id !== id));
      toast.success("Purchase order deleted successfully");
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete purchase order"
      );
    } finally {
      setDeleteId(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd-MM-yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Filter purchases based on search term
  const filteredPurchases =
    searchTerm.trim() === ""
      ? purchases
      : purchases.filter((purchase) => {
          const vendorName = purchase.Vendor?.name?.toLowerCase() || "";
          const materialName = purchase.Material?.name?.toLowerCase() || "";
          const status = purchase.status?.toLowerCase() || "";
          const searchLower = searchTerm.toLowerCase();

          return (
            vendorName.includes(searchLower) ||
            materialName.includes(searchLower) ||
            status.includes(searchLower)
          );
        });

  // Purchase table skeleton
  const PurchaseTableSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );

  // Full-screen Purchase Form
  const PurchaseForm = () => (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          {editRow ? "Edit Purchase Order" : "Add New Purchase Order"}
        </h1>
        <Button
          variant="ghost"
          onClick={() => {
            setShowForm(false);
            setEditRow(null);
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vendor field */}
              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 font-semibold">
                      Vendor *
                    </FormLabel>
                    <FormControl>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-600"
                        {...field}
                      >
                        <option value={0}>Select Vendor</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Order Date field */}
              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 font-semibold">
                      Order Date *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="w-full bg-white text-gray-800 border-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status field */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 font-semibold">
                      Status *
                    </FormLabel>
                    <FormControl>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-600"
                        {...field}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address field */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 font-semibold">
                      Delivery Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                        placeholder="Enter delivery address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h2 className="text-base font-semibold mb-2">Item Details</h2>
              <Card className="p-4 bg-white border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="w-1/3 text-gray-700 font-semibold">
                        Material
                      </TableHead>
                      <TableHead className="text-gray-700 font-semibold">
                        Quantity
                      </TableHead>
                      <TableHead className="text-gray-700 font-semibold">
                        Rate
                      </TableHead>
                      <TableHead className="text-gray-700 font-semibold">
                        Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name="materialId"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <select
                                  className="w-full p-2 border border-gray-300 rounded-md text-gray-600"
                                  {...field}
                                >
                                  <option value={0}>Select Material</option>
                                  {materials.map((material) => (
                                    <option
                                      key={material.id}
                                      value={material.id}
                                    >
                                      {material.name} ({material.uom})
                                    </option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name="qty"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="w-full bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name="rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="w-full bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-gray-800">
                        <span className="font-medium">
                          ₹
                          {(form.watch("qty") * form.watch("rate")).toFixed(
                            2
                          ) || "0.00"}
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditRow(null);
                }}
                className="text-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {form.formState.isSubmitting
                  ? "Saving..."
                  : editRow
                  ? "Update Purchase Order"
                  : "Save Purchase Order"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );

  // Purchase List View
  const PurchaseListView = () => (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div></div>
        <Button
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            setShowForm(true);
            setEditRow(null);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Purchase
        </Button>
      </div>

      {/* Search bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="   Search by vendor, material or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-50 border-b border-gray-200 text-gray-700 pl-10"
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 mb-4 text-red-500 bg-red-50 border border-red-200 rounded-md">
          <div className="font-medium mb-2">Error loading purchase data:</div>
          <p>{error}</p>
          <Button
            variant="link"
            className="mt-3 text-blue-500"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Purchases Table */}
      <Card className="bg-white border border-gray-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="w-[80px] text-gray-700 font-semibold">
                  Vendor
                </TableHead>
                <TableHead className="text-gray-700 font-semibold">
                  Material
                </TableHead>
                <TableHead className="text-gray-700 font-semibold">
                  Qty
                </TableHead>
                <TableHead className="text-gray-700 font-semibold">
                  Rate
                </TableHead>
                <TableHead className="text-gray-700 font-semibold">
                  Amount
                </TableHead>
                <TableHead className="text-gray-700 font-semibold">
                  Status
                </TableHead>
                <TableHead className="text-gray-700 font-semibold">
                  Date
                </TableHead>
                <TableHead className="text-gray-700 font-semibold text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <PurchaseTableSkeleton />
                  </TableCell>
                </TableRow>
              ) : filteredPurchases.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-gray-600"
                  >
                    {searchTerm.trim() !== ""
                      ? "No purchase orders match your search."
                      : 'No purchase orders found. Click "Add Purchase" to create one.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map((purchase) => (
                  <TableRow
                    key={purchase.id}
                    className="hover:bg-gray-50 border-b border-gray-200"
                  >
                    <TableCell className="text-gray-800">
                      {purchase.Vendor?.name || "Unknown"}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {purchase.Material?.name || "Unknown"}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {purchase.qty} {purchase.Material?.uom}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      ₹{purchase.rate.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      ₹{(purchase.qty * purchase.rate).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          purchase.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : purchase.status === "CONFIRMED"
                            ? "bg-yellow-100 text-yellow-800"
                            : purchase.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {purchase.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {formatDate(purchase.orderDate)}
                    </TableCell>
                    <TableCell className="text-center space-x-2">
                      <Button
                        variant="ghost"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => {
                          setEditRow(purchase);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setDeleteId(purchase.id);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Are you sure?</h3>
            <p className="text-gray-600 mb-4">
              This will permanently delete the purchase order. This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (deleteId) handleDelete(deleteId);
                  setShowDeleteConfirm(false);
                }}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Main return with conditional rendering of either form or list
  return (
    <AppShell pageTitle="Purchases">
      <div className="relative bg-white p-6">
        {showForm ? <PurchaseForm /> : <PurchaseListView />}
      </div>
    </AppShell>
  );
}
