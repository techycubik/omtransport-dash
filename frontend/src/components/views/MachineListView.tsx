import React, { useCallback } from "react";
import { Search, Settings, Power, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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

// Define the machine type
export interface CrusherMachine {
  id: number;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  lastMaintenanceDate: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MachineListViewProps {
  machines: CrusherMachine[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
  onEdit: (machine: CrusherMachine) => void;
  onToggleStatus: (machine: CrusherMachine) => void;
  loading: boolean;
}

export const MachineListView = React.memo(
  ({
    machines,
    searchTerm,
    onSearchChange,
    onAddNew,
    onEdit,
    onToggleStatus,
    loading,
  }: MachineListViewProps) => {
    // Format date helper
    const formatDate = (dateString: string) => {
      try {
        return format(new Date(dateString), "PP");
      } catch (error) {
        console.error("Error formatting date:", error);
        return dateString;
      }
    };

    // Filter machines based on search term
    const filteredMachines = searchTerm
      ? machines.filter(
          (machine) =>
            machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            machine.status.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : machines;

    // Use a stable reference for the change handler
    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
      },
      [onSearchChange]
    );

    return (
      <>
        <div className="flex items-center justify-between mb-6">
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
          <Button onClick={onAddNew}>
            <Plus size={16} className="mr-2" />
            Add Machine
          </Button>
        </div>

        <TableWrapper
          loading={loading}
          isEmpty={filteredMachines.length === 0}
          emptyMessage="No machines found."
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500"
                        onClick={() => onEdit(machine)}
                      >
                        <Settings size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`${
                          machine.status === "ACTIVE"
                            ? "text-green-500"
                            : "text-gray-500"
                        }`}
                        onClick={() => onToggleStatus(machine)}
                      >
                        <Power size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrapper>
      </>
    );
  }
);

MachineListView.displayName = "MachineListView";

export default MachineListView;
