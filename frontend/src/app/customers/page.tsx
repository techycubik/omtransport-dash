"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import CustomerForm from "@/components/forms/CustomerForm";
import type {
  Customer,
  CustomerFormValues,
} from "@/components/forms/CustomerForm";
import CustomerListView from "@/components/views/CustomerListView";
import CustomerTableSkeleton from "@/components/skeletons/CustomerTableSkeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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

  // Handle form submission - using useCallback to prevent recreation on each render
  const handleSubmit = useCallback(
    async (values: CustomerFormValues) => {
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

        // Handle successful response
        const result = await response.json();
        console.log("Form submission response:", result);

        // Show success message
        toast.success(
          editingCustomer
            ? "Customer updated!"
            : "Customer created successfully!"
        );

        // Reset form and state
        setShowForm(false);
        setEditingCustomer(null);

        // Refresh the customer list
        fetchCustomers();
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
      }
    },
    [editingCustomer]
  );

  // Handle delete - using useCallback to prevent recreation on each render
  const handleDelete = useCallback(async (id: number) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, []);

  // Delete confirmation - using useCallback to prevent recreation on each render
  const confirmDelete = useCallback(async () => {
    if (deleteId === null) return;

    try {
      const response = await api(`/api/customers/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete customer");
      }

      toast.success("Customer deleted successfully");
      fetchCustomers();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while deleting"
      );
    } finally {
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
  }, [deleteId]);

  // Handle search change - using useCallback to prevent recreation on each render
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Handle add new - using useCallback to prevent recreation on each render
  const handleAddNew = useCallback(() => {
    setEditingCustomer(null);
    setShowForm(true);
  }, []);

  // Handle edit - using useCallback to prevent recreation on each render
  const handleEdit = useCallback((customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  }, []);

  // Handle cancel - using useCallback to prevent recreation on each render
  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingCustomer(null);
  }, []);

  return (
    <AppShell pageTitle="Customers">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <Button
              className="bg-blue-600 text-white mt-2"
              onClick={() => fetchCustomers()}
            >
              Retry
            </Button>
          </div>
        ) : showForm ? (
          <CustomerForm
            editingCustomer={editingCustomer}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        ) : loading ? (
          <CustomerTableSkeleton />
        ) : (
          <CustomerListView
            customers={customers}
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
                Are you sure you want to delete this customer? This action
                cannot be undone.
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
