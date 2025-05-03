"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import VendorForm, {
  Vendor,
  VendorFormValues,
} from "@/components/forms/VendorForm";
import VendorListView from "@/components/views/VendorListView";
import VendorTableSkeleton from "@/components/skeletons/VendorTableSkeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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

  // Handle form submission - using useCallback to prevent recreation on each render
  const handleSubmit = useCallback(
    async (values: VendorFormValues) => {
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
          const errorText = await response.text();
          console.log("API response error text:", errorText);

          try {
            // Try to parse as JSON
            const errorData = JSON.parse(errorText);
            
            // Special handling for GST number already exists error
            if (errorData.error && errorData.error.includes("GST number already exists")) {
              const error = new Error("A vendor with this GST number already exists");
              error.name = "GSTDuplicateError";
              throw error;
            }
            
            // Handle other errors
            throw new Error(
              errorData.error ||
                (editingVendor
                  ? "Failed to update vendor"
                  : "Failed to create vendor")
            );
          } catch (parseError) {
            if (parseError instanceof Error && parseError.name === "GSTDuplicateError") {
              throw parseError;
            }
            
            // If it's not valid JSON, display the raw text as a toast error
            toast.error(
              errorText ||
                (editingVendor
                  ? "Failed to update vendor"
                  : "Failed to create vendor")
            );
            return; // Return early without throwing an error
          }
        }

        // Handle successful response
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
        setEditingVendor(null); // Clear editing state
        fetchVendors(); // Refresh the table
      } catch (error) {
        console.error("Error saving vendor:", error);
        
        // If it's a GST number duplicate error, we'll handle it in the form component
        if (error instanceof Error && error.message.includes("GST number already exists")) {
          throw error; // Rethrow to be caught by the form
        }
        
        toast.error(
          error instanceof Error ? error.message : "Failed to save vendor"
        );
      }
    },
    [editingVendor, fetchVendors]
  );

  // Handle edit - using useCallback to prevent recreation on each render
  const handleEdit = useCallback((vendor: Vendor) => {
    setEditingVendor(vendor);
    setShowForm(true);
  }, []);

  // Handle delete - using useCallback to prevent recreation on each render
  const handleDelete = useCallback((id: number) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, []);

  // Handle confirm delete - using useCallback to prevent recreation on each render
  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;

    try {
      const response = await api(`/api/vendors/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Try to parse error response
        const errorText = await response.text();
        let errorMessage = "Failed to delete vendor.";
        
        try {
          // Try to parse as JSON
          if (errorText) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          }
        } catch (parseError) {
          // If parsing fails, use the original error message
          console.error("Error parsing response:", parseError);
        }
        
        throw new Error(errorMessage);
      }

      // Parse the successful response 
      const result = await response.json();
      
      toast.success(result.message || "Vendor deleted successfully");

      // Remove the vendor from the list
      setVendors((prevVendors) => prevVendors.filter((v) => v.id !== deleteId));

      // Close the confirmation dialog
      setShowDeleteConfirm(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting vendor:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete vendor."
      );
    }
  }, [deleteId]);

  // Handle search change - using useCallback to prevent recreation on each render
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Handle add new - using useCallback to prevent recreation on each render
  const handleAddNew = useCallback(() => {
    setEditingVendor(null);
    setShowForm(true);
  }, []);

  // Handle cancel - using useCallback to prevent recreation on each render
  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingVendor(null);
  }, []);

  return (
    <AppShell pageTitle="Vendors">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <Button
              className="bg-blue-600 text-white mt-2"
              onClick={() => fetchVendors()}
            >
              Retry
            </Button>
          </div>
        ) : showForm ? (
          <VendorForm
            editingVendor={editingVendor}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        ) : loading ? (
          <VendorTableSkeleton />
        ) : (
          <VendorListView
            vendors={vendors}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onAddNew={handleAddNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 bg-white max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p className="mb-6">
                Are you sure you want to delete this vendor? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
