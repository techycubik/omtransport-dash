import React, { useCallback } from "react";
import { format } from "date-fns";
import { Search, Plus } from "lucide-react";
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

// Define types
interface Material {
  id: number;
  name: string;
  uom: string;
}

interface Customer {
  id: number;
  name: string;
}

interface CrusherRun {
  id: number;
  materialId: number;
  producedQty: number;
  dispatchedQty: number;
  Material?: Material;
}

interface SalesOrder {
  id: number;
  customerId: number;
  materialId: number;
  qty: number;
  Customer?: Customer;
}

export interface Dispatch {
  id: number;
  crusherRunId: number;
  salesOrderId?: number;
  dispatchDate: string;
  quantity: number;
  destination: string;
  vehicleNo: string;
  driver?: string;
  pickupQuantity?: number;
  dropQuantity?: number;
  deliveryStatus: "PENDING" | "IN_TRANSIT" | "DELIVERED";
  deliveryDuration?: number;
  CrusherRun?: CrusherRun;
  SalesOrder?: SalesOrder;
}

interface DispatchListViewProps {
  dispatches: Dispatch[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
  loading: boolean;
}

export const DispatchListView = React.memo(
  ({
    dispatches,
    searchTerm,
    onSearchChange,
    onAddNew,
    loading,
  }: DispatchListViewProps) => {
    // Format date helper
    const formatDate = (dateString: string) => {
      try {
        return format(new Date(dateString), "MMM dd, yyyy");
      } catch (error) {
        console.error("Error formatting date:", error);
        return dateString;
      }
    };

    // Calculate difference between pickup and drop quantities
    const calculateDifference = (pickupQty?: number, dropQty?: number) => {
      if (
        pickupQty === undefined ||
        dropQty === undefined ||
        pickupQty === null ||
        dropQty === null
      ) {
        return null;
      }
      return (pickupQty - dropQty).toFixed(2);
    };

    // Filter dispatches based on search term
    const filteredDispatches = searchTerm
      ? dispatches.filter((dispatch) => {
          const searchLower = searchTerm.toLowerCase();
          return (
            dispatch.destination.toLowerCase().includes(searchLower) ||
            dispatch.vehicleNo.toLowerCase().includes(searchLower) ||
            dispatch.CrusherRun?.Material?.name
              ?.toLowerCase()
              .includes(searchLower) ||
            dispatch.deliveryStatus.toLowerCase().includes(searchLower)
          );
        })
      : dispatches;

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
              placeholder="Search dispatches..."
              className="pl-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <Button onClick={onAddNew}>
            <Plus size={16} className="mr-2" />
            New Dispatch
          </Button>
        </div>

        <TableWrapper
          loading={loading}
          isEmpty={filteredDispatches.length === 0}
          emptyMessage="No dispatches found."
          searchTerm={searchTerm}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Pickup Qty</TableHead>
                <TableHead>Drop Qty</TableHead>
                <TableHead>Difference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDispatches.map((dispatch) => {
                const difference = calculateDifference(
                  dispatch.pickupQuantity,
                  dispatch.dropQuantity
                );
                const isLate =
                  dispatch.deliveryDuration !== undefined &&
                  dispatch.deliveryDuration > 2;

                return (
                  <TableRow key={dispatch.id}>
                    <TableCell>{formatDate(dispatch.dispatchDate)}</TableCell>
                    <TableCell>
                      {dispatch.CrusherRun?.Material?.name || "Unknown"}
                    </TableCell>
                    <TableCell>{dispatch.destination}</TableCell>
                    <TableCell>{dispatch.vehicleNo}</TableCell>
                    <TableCell>
                      {dispatch.quantity} {dispatch.CrusherRun?.Material?.uom}
                    </TableCell>
                    <TableCell>{dispatch.pickupQuantity ?? "-"}</TableCell>
                    <TableCell>{dispatch.dropQuantity ?? "-"}</TableCell>
                    <TableCell
                      className={
                        difference && difference !== "0.00"
                          ? "text-red-600 font-medium"
                          : ""
                      }
                    >
                      {difference !== null ? difference : "-"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={dispatch.deliveryStatus} />
                    </TableCell>
                    <TableCell
                      className={isLate ? "text-red-600 font-medium" : ""}
                    >
                      {dispatch.deliveryDuration !== undefined
                        ? `${dispatch.deliveryDuration} days`
                        : "-"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableWrapper>
      </>
    );
  }
);

DispatchListView.displayName = "DispatchListView";

export default DispatchListView;
