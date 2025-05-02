"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import MachineForm, { MachineFormValues } from "@/components/forms/MachineForm";
import MachineListView, {
  CrusherMachine,
} from "@/components/views/MachineListView";

export default function MachineList() {
  const [machines, setMachines] = useState<CrusherMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState<CrusherMachine | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch machines
  const fetchMachines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api("/api/crusher/machines");
      if (!response.ok) {
        throw new Error(`Failed to fetch machines: ${response.status}`);
      }
      const data = await response.json();
      setMachines(data);
    } catch (error) {
      console.error("Error fetching machines:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load machines. Please try again later.";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  const handleFormSubmit = useCallback(
    async (values: MachineFormValues) => {
      try {
        // Format date as ISO string
        const formattedValues = {
          ...values,
          lastMaintenanceDate: new Date(
            values.lastMaintenanceDate
          ).toISOString(),
        };

        let response;
        let successMessage;

        if (editingMachine) {
          // Update existing machine
          response = await api(`/api/crusher/machines/${editingMachine.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formattedValues),
          });
          successMessage = "Machine updated successfully";
        } else {
          // Create new machine
          response = await api("/api/crusher/machines", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formattedValues),
          });
          successMessage = "Machine created successfully";
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          throw new Error(
            `Failed to save machine: ${response.status} ${errorText}`
          );
        }

        const savedMachine = await response.json();

        if (editingMachine) {
          // Update the machine in the list
          setMachines(
            machines.map((m) => (m.id === editingMachine.id ? savedMachine : m))
          );
        } else {
          // Add the new machine to the list
          setMachines([savedMachine, ...machines]);
        }

        // Reset the form and hide it
        setEditingMachine(null);
        setShowForm(false);
        toast.success(successMessage);
      } catch (error) {
        console.error("Error saving machine:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to save machine. Please try again later.";

        toast.error(errorMessage);
      }
    },
    [editingMachine, machines]
  );

  const handleToggleStatus = useCallback(
    async (machine: CrusherMachine) => {
      try {
        // Determine the new status
        const newStatus = machine.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

        // Update the machine status
        const response = await api(`/api/crusher/machines/${machine.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          throw new Error(
            `Failed to update machine status: ${response.status} ${errorText}`
          );
        }

        const updatedMachine = await response.json();

        // Update the machine in the list
        setMachines(
          machines.map((m) => (m.id === machine.id ? updatedMachine : m))
        );

        toast.success(
          `Machine ${updatedMachine.name} is now ${updatedMachine.status}`
        );
      } catch (error) {
        console.error("Error updating machine status:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update machine status. Please try again later.";

        toast.error(errorMessage);
      }
    },
    [machines]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleAddNew = useCallback(() => {
    setShowForm(true);
    setEditingMachine(null);
  }, []);

  const handleEdit = useCallback((machine: CrusherMachine) => {
    setEditingMachine(machine);
    setShowForm(true);
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingMachine(null);
  }, []);

  return (
    <Card className="p-6">
      {showForm ? (
        <MachineForm
          editingMachine={editingMachine}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <MachineListView
          machines={machines}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          loading={loading}
        />
      )}
    </Card>
  );
}
