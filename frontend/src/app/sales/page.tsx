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
import { Plus, ArrowLeft, X, Search } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

// Define types
interface Material {
  id: number;
  name: string;
  uom: string;
}

interface Customer {
  id: number;
  name: string;
  address?: string;
  gstNo?: string;
  contact?: string;
}

interface SalesOrder {
  id: number;
  customerId: number;
  materialId: number;
  qty: number;
  rate: number;
  vehicleNo?: string;
  orderDate: string;
  createdAt?: string;
  updatedAt?: string;
  Customer?: Customer;
  Material?: Material;
}

// Define the form schema
const formSchema = z.object({
  customerId: z.coerce.number().positive("Please select a customer"),
  materialId: z.coerce.number().positive("Please select a material"),
  qty: z.coerce.number().positive("Quantity must be positive"),
  rate: z.coerce.number().positive("Rate must be positive"),
  vehicleNo: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  orderDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
  // Address is optional but shouldn't be included in the API request
  address: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
});

type FormValues = z.infer<typeof formSchema>;

export default function SalesPage() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: 0,
      materialId: 0,
      qty: 0,
      rate: 0,
      vehicleNo: "",
      orderDate: format(new Date(), "yyyy-MM-dd"),
      address: "",
    },
  });

  // Fetch sales orders, customers and materials
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch sales orders
        const salesResponse = await api("/api/sales");
        if (!salesResponse.ok) {
          const errorText = await salesResponse
            .text()
            .catch(() => "Unknown error");
          console.error(
            `Failed to fetch sales orders: ${salesResponse.status} ${errorText}`
          );
          throw new Error(
            `Failed to fetch sales orders: ${salesResponse.status}`
          );
        }
        const salesData = await salesResponse.json();
        setSalesOrders(salesData);

        // Fetch customers
        const customersResponse = await api("/api/customers");
        if (!customersResponse.ok) {
          const errorText = await customersResponse
            .text()
            .catch(() => "Unknown error");
          console.error(
            `Failed to fetch customers: ${customersResponse.status} ${errorText}`
          );
          throw new Error(
            `Failed to fetch customers: ${customersResponse.status}`
          );
        }
        const customersData = await customersResponse.json();
        setCustomers(customersData);

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

        // Display a more user-friendly error message
        let displayError = errorMessage;
        if (errorMessage.includes("500")) {
          displayError =
            "Database error. The sales orders table may not exist or the database connection failed.";
        }

        setError(displayError);
        toast.error(displayError);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

      const response = await api("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedValues),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API response error:", errorText);

        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Failed to create sale order");
        } catch (parseError) {
          // If it's not valid JSON, use the raw text
          throw new Error(errorText || "Failed to create sale order");
        }
      }

      const newSaleOrder = await response.json();

      // Add customer and material details to the new sale order
      const customer = customers.find((c) => c.id === newSaleOrder.customerId);
      const material = materials.find((m) => m.id === newSaleOrder.materialId);

      const enhancedSaleOrder = {
        ...newSaleOrder,
        Customer: customer,
        Material: material,
      };

      // Update the sales orders list
      setSalesOrders((prevOrders) => [...prevOrders, enhancedSaleOrder]);

      toast.success("Sale order created successfully");
      setShowForm(false);
      form.reset();
    } catch (error) {
      console.error("Error creating sale order:", error);
      // Log more detailed error information
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      toast.error(
        error instanceof Error ? error.message : "Failed to create sale order"
      );
    }
  };

  // Sales table skeleton
  const SalesTableSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd-MM-yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Filter sales based on search term
  const filteredSalesOrders =
    searchTerm.trim() === ""
      ? salesOrders
      : salesOrders.filter((order) => {
          const searchLower = searchTerm.toLowerCase();
          const customerName = order.Customer?.name?.toLowerCase() || "";
          const materialName = order.Material?.name?.toLowerCase() || "";
          const vehicleNo = order.vehicleNo?.toLowerCase() || "";

          return (
            customerName.includes(searchLower) ||
            materialName.includes(searchLower) ||
            vehicleNo.includes(searchLower)
          );
        });

  // Full-screen Sales Form
  const SalesForm = () => (
    <div className="w-full">
      <div className="mb-4 flex flex-col items-start">
        <Button
          variant="ghost"
          onClick={() => setShowForm(false)}
          className="mb-2 text-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1 text-gray-800" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">
          Add New Sales Order
        </h1>
      </div>

      <Card className="p-10 bg-white border border-gray-200">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer field */}
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 font-semibold">
                      Customer Name *
                    </FormLabel>
                    <FormControl>
                      <select
                        className="w-full p-2 border border-gray-200 rounded-md text-gray-600  "
                        {...field}
                      >
                        <option value={0}>Select Customer</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
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

              {/* Vehicle Number field */}
              <FormField
                control={form.control}
                name="vehicleNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 font-semibold">
                      Vehicle Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter vehicle number"
                        {...field}
                        className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                      />
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
                        placeholder="Enter delivery address"
                        {...field}
                        className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h2 className="text-base font-semibold mb-2">Item Details</h2>
              <Card className=" bg-white border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="w-1/4 text-gray-700 font-semibold">
                        Material
                      </TableHead>
                      <TableHead className="w-1/4 text-gray-700 font-semibold">
                        Quantity
                      </TableHead>
                      <TableHead className="w-1/4 text-gray-700 font-semibold">
                        Rate
                      </TableHead>
                      <TableHead className="w-1/4 text-gray-700 font-semibold">
                        Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-gray-50 border-b border-gray-200">
                      <TableCell className="text-gray-800">
                        <FormField
                          control={form.control}
                          name="materialId"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <select
                                  className="w-full p-2 border border-gray-200 rounded-md text-gray-600"
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
                      <TableCell className="text-gray-800">
                        <FormField
                          control={form.control}
                          name="qty"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
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
                        <FormField
                          control={form.control}
                          name="rate"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="p-3 bg-white text-gray-800 placeholder:text-gray-400 placeholder:font-thin border-gray-300"
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
                onClick={() => setShowForm(false)}
                className="text-gray-800 "
              >
                Cancel
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white "
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Saving..." : "Save Order"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );

  // Sales List View
  const SalesListView = () => (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div></div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Plus className="h-4 w-4" />
          Add Sale
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="   Search by customer, material or vehicle number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-50 border-b border-gray-200 text-gray-700 pl-10"
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 mb-4 text-red-500 bg-red-50 border border-red-200 rounded-md">
          <div className="font-medium mb-2">Error loading sales data:</div>
          <p>{error}</p>
          {error.includes("Database error") && (
            <div className="mt-3 text-sm">
              <p className="font-medium">Possible solutions:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Ensure the PostgreSQL database server is running</li>
                <li>
                  Run migrations to create the required tables:
                  <pre className="bg-gray-100 p-2 mt-1 rounded text-xs overflow-x-auto">
                    cd backend
                    <br />
                    npx sequelize-cli db:migrate
                  </pre>
                </li>
                <li>
                  Check database connection settings in the backend/.env file:
                  <pre className="bg-gray-100 p-2 mt-1 rounded text-xs overflow-x-auto">
                    DB_HOST=localhost
                    <br />
                    DB_PORT=5432
                    <br />
                    DB_USER=omadmin
                    <br />
                    DB_PASSWORD=ompass
                    <br />
                    DB_NAME=omdb
                  </pre>
                </li>
              </ul>
            </div>
          )}
          <Button
            variant="link"
            className="mt-3 text-blue-500"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Sales Orders Table */}
      <Card className="bg-white border border-gray-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="w-[80px] text-gray-700 font-semibold">
                  Customer
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
                  Vehicle #
                </TableHead>
                <TableHead className="text-gray-700 font-semibold">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <SalesTableSkeleton />
                  </TableCell>
                </TableRow>
              ) : filteredSalesOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-6 text-gray-600"
                  >
                    {searchTerm.trim() !== ""
                      ? "No sales orders match your search."
                      : 'No sales orders found. Click "Add Sale" to create one.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSalesOrders.map((order) => (
                  <TableRow className="text-gray-800" key={order.id}>
                    <TableCell className="font-medium text-gray-800">
                      {order.Customer?.name || "Unknown"}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {order.Material?.name || "Unknown"}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {order.qty} {order.Material?.uom}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      ₹{order.rate.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      ₹{(order.qty * order.rate).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {order.vehicleNo || "-"}
                    </TableCell>
                    <TableCell className="text-gray-800">
                      {formatDate(order.orderDate)}
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

  // Main return with conditional rendering of either form or list
  return (
    <AppShell pageTitle={showForm ? "" : "Sales Orders"}>
      <div className="relative bg-white p-6">
        {showForm ? <SalesForm /> : <SalesListView />}
      </div>
    </AppShell>
  );
}
