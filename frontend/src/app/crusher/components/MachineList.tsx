"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import MachineForm, { MachineFormValues } from "@/components/forms/MachineForm";
import { ArrowLeft, Plus, Search, Settings, Power, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableWrapper, { StatusBadge } from "@/components/TableWrapper"; 
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export interface CrusherMachine {
  id: number;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  lastMaintenanceDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function MachineList() {
  const [machines, setMachines] = useState<CrusherMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState<CrusherMachine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState<CrusherMachine | null>(null);

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

  const handleDelete = useCallback(async (machine: CrusherMachine) => {
    try {
      const response = await api(`/api/crusher/machines/${machine.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `Failed to delete machine: ${response.status} ${errorText}`
        );
      }

      const updatedMachines = machines.filter((m) => m.id !== machine.id);
      setMachines(updatedMachines);
      toast.success("Machine deleted successfully");
    } catch (error) {
      console.error("Error deleting machine:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete machine. Please try again later.";

      toast.error(errorMessage);
    }
  }, [machines]);

  // Filter machines based on search term
  const filteredMachines = searchTerm
    ? machines.filter(
        (machine) =>
          machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          machine.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : machines;

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-2 p-0 hover:bg-transparent"
            onClick={handleCancel}
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-black" >
            {editingMachine ? "Edit Machine" : "Add New Machine"}
          </h2>
        </div>
        
        <Card className="p-6">
          <MachineForm
            editingMachine={editingMachine}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        </Card>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-72">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            placeholder="Search machines..."
            className="pl-10"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-black hover:bg-primary/90"
          onClick={handleAddNew}
        >
          <Plus size={16} />
          Add New Machine
        </button>
      </div>
      
      <TableWrapper
        loading={loading}
        isEmpty={filteredMachines.length === 0}
        emptyMessage="No machines found. Add your first machine!"
        searchTerm={searchTerm}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Machine</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Maintenance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMachines.map((machine) => (
              <TableRow key={machine.id}>
                <TableCell className="font-medium">{machine.name}</TableCell>
                <TableCell>
                  <StatusBadge status={machine.status} />
                </TableCell>
                <TableCell>
                  {formatDate(machine.lastMaintenanceDate)}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <button 
                      className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium flex items-center gap-1 text-gray-700 hover:bg-gray-50"
                      onClick={() => handleEdit(machine)}
                    >
                      <Settings size={14} />
                      Edit
                    </button>
                    <button
                      className={`px-3 py-1 border border-gray-300 rounded-md text-xs font-medium flex items-center gap-1 ${
                        machine.status === "ACTIVE"
                          ? "text-green-600 hover:bg-gray-50"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                      onClick={() => handleToggleStatus(machine)}
                    >
                      <Power size={14} />
                      {machine.status === "ACTIVE" ? "Active" : "Inactive"}
                    </button>
                    <button
                      className="px-3 py-1 border border-gray-300 rounded-md text-xs font-medium flex items-center gap-1 text-red-500 hover:bg-gray-50"
                      onClick={() => {
                        setIsDeleteDialogOpen(true);
                        setMachineToDelete(machine);
                      }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <p>
            This will permanently delete the machine "{machineToDelete?.name}".
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4 mt-6">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
              onClick={() => {
                if (machineToDelete) {
                  handleDelete(machineToDelete);
                  setIsDeleteDialogOpen(false);
                  setMachineToDelete(null);
                }
              }}
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
