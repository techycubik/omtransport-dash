"use client";

import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import SalesForm from "@/components/forms/SalesForm";
import SalesListView from "@/components/views/SalesListView";
import SalesTableSkeleton from "@/components/skeletons/SalesTableSkeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

interface SalesOrderItem {
  id?: number;
  materialId: number;
  crusherSiteId?: number;
  qty: number;
  rate: number;
  uom: string;
  Material?: Material;
  CrusherSite?: {
    id: number;
    name: string;
    location: string;
  };
}

interface SalesOrder {
  id: number;
  customerId: number;
  vehicleNo?: string;
  challanNo?: string;
  address?: string;
  orderDate: string;
  createdAt?: string;
  updatedAt?: string;
  Customer?: Customer;
  SalesOrderItems?: SalesOrderItem[];
}

// Define the form schema with items array
const formSchema = z.object({
  customerId: z.coerce.number().positive("Please select a customer"),
  vehicleNo: z
    .string()
    .optional()
    .transform((val) => (val === "" ? undefined : val)),
  challanNo: z
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
  items: z.array(z.object({
    materialId: z.coerce.number().positive("Please select a material"),
    crusherSiteId: z.coerce.number().optional(),
    qty: z.coerce.number().positive("Quantity must be positive"),
    rate: z.coerce.number().positive("Rate must be positive"),
    uom: z.string().min(1, "UOM is required"),
  })).min(1, "At least one item is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SalesPage() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch sales orders, customers and materials
  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = useCallback(async (values: FormValues) => {
    try {
      // Format date as ISO string
      const formattedValues = {
        ...values,
        orderDate: new Date(values.orderDate).toISOString(),
      };

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

      // Update the state with new sale order
      setSalesOrders((prev) => [newSaleOrder, ...prev]);

      // Reset form and hide it
      setShowForm(false);
      toast.success("Sale order created successfully");
    } catch (error) {
      console.error("Error creating sale:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create sale order. Please try again later.";

      toast.error(errorMessage);
      throw error; // Rethrow to let the form handle it
    }
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleAddNew = useCallback(() => {
    setShowForm(true);
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
  }, []);

  // Main return with conditional rendering of either form or list
  return (
    <AppShell pageTitle={showForm ? "" : "Sales Orders"}>
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <Button
              className="bg-blue-600 text-white mt-2"
              onClick={() => fetchData()}
            >
              Retry
            </Button>
          </div>
        ) : showForm ? (
          <SalesForm
            customers={customers}
            materials={materials}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        ) : loading ? (
          <SalesTableSkeleton />
        ) : (
          <SalesListView
            salesOrders={salesOrders}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onAddNew={handleAddNew}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </AppShell>
  );
}
