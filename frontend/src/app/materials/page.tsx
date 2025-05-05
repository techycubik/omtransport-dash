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
      const response = await api("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to create material");

      toast.success("Material created successfully");
      setShowForm(false);
      fetchMaterials();
    } catch (error) {
      console.error("Error creating material:", error);
      toast.error("Failed to create material");
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
    <AppShell pageTitle={showForm ? "Add New Material" : "Materials"}>
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        {showForm ? (
          <MaterialForm onSubmit={handleSubmit} onCancel={handleCancel} />
        ) : (
          <MaterialListView
            materials={materials}
            loading={loading}
            onAddNew={handleAddNew}
          />
        )}
      </div>
    </AppShell>
  );
}
