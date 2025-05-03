"use client";

import { useState, useEffect, useCallback } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import MaterialForm, {
  Material,
  MaterialFormValues,
} from "@/components/forms/MaterialForm";
import MaterialListView from "@/components/views/MaterialListView";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Load materials on component mount
  useEffect(() => {
    fetchMaterials();
  }, []);

  // Function to fetch materials
  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await api("/api/materials");
      if (!response.ok) throw new Error("Failed to fetch materials");
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = useCallback(async (values: MaterialFormValues) => {
    try {
      console.log("Submitting material:", values);
      const response = await api("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const responseData = await response.json().catch(() => null);
      console.log("Create material response:", responseData);

      if (!response.ok) {
        if (responseData?.error && responseData.error.includes("already exists")) {
          toast.error("A material with this name already exists");
        } else {
          toast.error("Failed to create material");
        }
        return;
      }

      toast.success("Material created successfully");
      setShowForm(false);
      fetchMaterials();
    } catch (error) {
      console.error("Error creating material:", error);
      toast.error("Failed to create material");
    }
  }, []);

  // Handle delete
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("Are you sure you want to delete this material?")) {
      return;
    }
    
    try {
      console.log(`Deleting material with ID: ${id}`);
      const response = await api(`/api/materials/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.error("Delete error response:", errorText);
        throw new Error(`Failed to delete material: ${errorText}`);
      }

      toast.success("Material deleted successfully");
      fetchMaterials();
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error(`Failed to delete material: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setShowForm(false);
  }, []);

  // Handle add new
  const handleAddNew = useCallback(() => {
    setShowForm(true);
  }, []);

  return (
    <AppShell pageTitle="Materials">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        {showForm ? (
          <MaterialForm onSubmit={handleSubmit} onCancel={handleCancel} />
        ) : (
          <MaterialListView
            materials={materials}
            loading={loading}
            onAddNew={handleAddNew}
            onDelete={handleDelete}
          />
        )}
      </div>
    </AppShell>
  );
}
