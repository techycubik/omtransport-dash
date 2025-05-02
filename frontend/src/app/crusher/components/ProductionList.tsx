"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import ProductionForm, {
  ProductionFormValues,
  CrusherRun,
} from "@/components/forms/ProductionForm";
import ProductionListView from "@/components/views/ProductionListView";

// Define types
interface Material {
  id: number;
  name: string;
  uom: string;
}

interface CrusherMachine {
  id: number;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  lastMaintenanceDate: string;
}

export default function ProductionList() {
  const [production, setProduction] = useState<CrusherRun[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [machines, setMachines] = useState<CrusherMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch production data, materials, and machines
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch production data
      const productionResponse = await api("/api/crusher/runs");
      if (!productionResponse.ok) {
        throw new Error(
          `Failed to fetch production data: ${productionResponse.status}`
        );
      }
      const productionData = await productionResponse.json();
      setProduction(productionData);

      // Fetch materials
      const materialsResponse = await api("/api/materials");
      if (!materialsResponse.ok) {
        throw new Error(
          `Failed to fetch materials: ${materialsResponse.status}`
        );
      }
      const materialsData = await materialsResponse.json();
      setMaterials(materialsData);

      // Fetch machines
      const machinesResponse = await api("/api/crusher/machines");
      if (!machinesResponse.ok) {
        throw new Error(`Failed to fetch machines: ${machinesResponse.status}`);
      }
      const machinesData = await machinesResponse.json();
      setMachines(machinesData);
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

  const handleFormSubmit = useCallback(async (values: ProductionFormValues) => {
    try {
      // Log the form values for debugging
      console.log("Form values:", values);

      // Format date as ISO string
      const formattedValues = {
        ...values,
        runDate: new Date(values.runDate).toISOString(),
        dispatchedQty: 0,
        status: "PENDING",
      };

      // Send the data to the server
      const response = await api("/api/crusher/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedValues),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `Failed to create production entry: ${response.status} ${errorText}`
        );
      }

      // Add the new production entry to the list
      const newProduction = await response.json();
      setProduction((prev) => [newProduction, ...prev]);

      // Reset the form and hide it
      setShowForm(false);
      toast.success("Production entry created successfully");
    } catch (error) {
      console.error("Error creating production entry:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create production entry. Please try again later.";

      toast.error(errorMessage);
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

  return (
    <Card className="p-6">
      {showForm ? (
        <ProductionForm
          materials={materials}
          machines={machines}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <ProductionListView
          production={production}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onAddNew={handleAddNew}
          loading={loading}
        />
      )}
    </Card>
  );
}
