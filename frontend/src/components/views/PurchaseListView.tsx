import React, { useCallback } from "react";
import { Search, Edit, Trash2, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
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
import { PurchaseOrder } from "../forms/PurchaseForm";
import { format } from "date-fns";

interface PurchaseListViewProps {
  purchases: PurchaseOrder[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
  onEdit: (purchase: PurchaseOrder) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

// Loading skeleton component
const PurchaseTableSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
      </div>
    ))}
  </div>
);

export const PurchaseListView = React.memo(
  ({
    purchases,
    searchTerm,
    onSearchChange,
    onAddNew,
    onEdit,
    onDelete,
    isLoading,
    error,
    onRetry,
  }: PurchaseListViewProps) => {
    // Filter purchases based on search term
    const filteredPurchases = purchases.filter(
      (purchase) =>
        purchase.Vendor?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        purchase.Material?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        purchase.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Use a stable reference for the change handler
    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
      },
      [onSearchChange]
    );

    // Format date helper
    const formatDate = (dateString: string) => {
      try {
        return format(new Date(dateString), "MMM dd, yyyy");
      } catch (error) {
        return "Invalid date";
      }
    };

    return (
      <>
        <div className="mb-6 flex items-center justify-between">
          <div></div>
          <Button
            className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white"
            onClick={onAddNew}
          >
            <Plus className="h-4 w-4" />
            Add Purchase
          </Button>
        </div>

        {/* Search bar */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by vendor, material or status..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="bg-white border-gray-200 text-gray-700 pl-10"
          />
        </div>

        {/* Error display */}
        {error && (
          <div className="p-4 mb-4 text-red-500 bg-red-50 border border-red-200 rounded-md">
            <div className="font-medium mb-2">Error loading purchase data:</div>
            <p>{error}</p>
            <Button
              variant="link"
              className="mt-3 text-teal-500"
              onClick={onRetry}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Purchases Table */}
        <Card className="bg-white border border-gray-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-[80px] text-gray-700 font-semibold">
                    Vendor
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Material
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Qty
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Rate
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Amount
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Date
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <PurchaseTableSkeleton />
                    </TableCell>
                  </TableRow>
                ) : filteredPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-6 text-gray-600"
                    >
                      {searchTerm.trim() !== ""
                        ? "No purchase orders match your search."
                        : 'No purchase orders found. Click "Add Purchase" to create one.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <TableRow
                      key={purchase.id}
                      className="hover:bg-gray-50 border-b border-gray-200"
                    >
                      <TableCell className="text-gray-800">
                        {purchase.Vendor?.name || "Unknown"}
                      </TableCell>
                      <TableCell className="text-gray-800">
                        {purchase.Material?.name || "Unknown"}
                      </TableCell>
                      <TableCell className="text-gray-800">
                        {purchase.qty} {purchase.Material?.uom}
                      </TableCell>
                      <TableCell className="text-gray-800">
                        ₹{purchase.rate.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-gray-800">
                        ₹{(purchase.qty * purchase.rate).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            purchase.status === "DELIVERED"
                              ? "bg-green-100 text-green-800"
                              : purchase.status === "CONFIRMED"
                              ? "bg-yellow-100 text-yellow-800"
                              : purchase.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {purchase.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-800">
                        {formatDate(purchase.orderDate)}
                      </TableCell>
                      <TableCell className="text-center space-x-2">
                        <Button
                          variant="ghost"
                          className="text-teal-600 border-teal-200 hover:bg-teal-50"
                          onClick={() => onEdit(purchase)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => onDelete(purchase.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </>
    );
  }
);

PurchaseListView.displayName = "PurchaseListView";

export default PurchaseListView;
