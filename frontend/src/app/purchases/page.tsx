"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import PurchaseForm, {
  PurchaseFormValues,
  PurchaseOrder,
} from "@/components/forms/PurchaseForm";
import PurchaseListView from "@/components/views/PurchaseListView";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

  // Fetch purchases, vendors and materials
  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFormSubmit = useCallback(
    async (values: PurchaseFormValues) => {
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

        // Refresh the data
        await fetchData();

        // Close the form
        setShowForm(false);
        setEditRow(null);

        // Show success message
        toast.success(
          editRow
            ? "Purchase order updated successfully!"
            : "Purchase order created successfully!"
        );
      } catch (error) {
        console.error("Error saving purchase order:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to save purchase order. Please try again."
        );
      }
    },
    [editRow, fetchData]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        const response = await api(`/api/purchases/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to delete purchase order");
        }

        // Refresh the data
        await fetchData();
        toast.success("Purchase order deleted successfully!");
        setDeleteId(null);
      } catch (error) {
        console.error("Error deleting purchase order:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to delete purchase order. Please try again."
        );
      }
    },
    [fetchData]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleAddNew = useCallback(() => {
    setShowForm(true);
    setEditRow(null);
  }, []);

  const handleEdit = useCallback((purchase: PurchaseOrder) => {
    setEditRow(purchase);
    setShowForm(true);
  }, []);

  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setEditRow(null);
  }, []);

  const handleDeleteClick = useCallback((id: number) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteId) {
      handleDelete(deleteId);
    }
    setShowDeleteConfirm(false);
  }, [deleteId, handleDelete]);

  // Main return with conditional rendering of either form or list
  return (
    <AppShell pageTitle={showForm ? "" : "Purchases"}>
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        {showForm ? (
          <PurchaseForm
            editRow={editRow}
            vendors={vendors}
            materials={materials}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        ) : (
          <>
            <PurchaseListView
              purchases={purchases}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onAddNew={handleAddNew}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              isLoading={loading}
              error={error}
              onRetry={fetchData}
            />

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="p-6 bg-white max-w-md w-full">
                  <h3 className="text-lg font-semibold mb-2">Are you sure?</h3>
                  <p className="text-gray-600 mb-4">
                    This will permanently delete the purchase order. This action
                    cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleCancelDelete}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmDelete}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
