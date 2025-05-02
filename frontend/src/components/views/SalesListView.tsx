"use client";

import React, { useCallback } from "react";
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
import { Search, Plus } from "lucide-react";
import { format } from "date-fns";

// Define types
interface Material {
  id: number;
  name: string;
  uom: string;
}

interface Customer {
  id: number;
  name: string;
  address?: string;
  gstNo?: string;
  contact?: string;
}

interface SalesOrder {
  id: number;
  customerId: number;
  materialId: number;
  qty: number;
  rate: number;
  vehicleNo?: string;
  orderDate: string;
  createdAt?: string;
  updatedAt?: string;
  Customer?: Customer;
  Material?: Material;
}

interface SalesListViewProps {
  salesOrders: SalesOrder[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
  loading: boolean;
  error: string | null;
}

const SalesListView = React.memo(
  ({
    salesOrders,
    searchTerm,
    onSearchChange,
    onAddNew,
    loading,
    error,
  }: SalesListViewProps) => {
    const filteredSalesOrders =
      searchTerm.trim() === ""
        ? salesOrders
        : salesOrders.filter((order) => {
            const searchLower = searchTerm.toLowerCase();
            const customerName = order.Customer?.name?.toLowerCase() || "";
            const materialName = order.Material?.name?.toLowerCase() || "";
            const vehicleNo = order.vehicleNo?.toLowerCase() || "";

            return (
              customerName.includes(searchLower) ||
              materialName.includes(searchLower) ||
              vehicleNo.includes(searchLower)
            );
          });

    const formatDate = (dateString: string) => {
      try {
        return format(new Date(dateString), "dd MMM yyyy");
      } catch (error) {
        console.error("Invalid date:", dateString);
        return "Invalid date";
      }
    };

    // Use a stable reference for the change handler
    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
      },
      [onSearchChange]
    );

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <Button
            className="bg-blue-600 text-white mt-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className="mb-6 flex items-center justify-between">
          <div></div>
          <Button
            className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white"
            onClick={onAddNew}
          >
            <Plus className="h-4 w-4" />
            Add Sale
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by customer, material or vehicle number..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="bg-white border-gray-200 text-gray-700 pl-10"
          />
        </div>

        <Card className="bg-white border border-gray-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-gray-700 font-semibold">
                    ID
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Date
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Customer
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Material
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Quantity
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Rate
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Amount
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Vehicle
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="space-y-3">
                        {[...Array(5)].map((_, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-4"
                          >
                            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSalesOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-gray-600"
                    >
                      {searchTerm
                        ? "No matching sales orders found. Try a different search term."
                        : "No sales orders yet. Click 'Add Sale' to create one."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSalesOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="hover:bg-gray-50 border-b border-gray-200"
                    >
                      <TableCell className="font-medium text-gray-800">
                        {order.id}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {formatDate(order.orderDate)}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {order.Customer?.name}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {order.Material?.name}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {order.qty} {order.Material?.uom}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 2,
                        }).format(order.rate)}
                      </TableCell>
                      <TableCell className="font-medium text-gray-800">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 2,
                        }).format(order.qty * order.rate)}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {order.vehicleNo || "—"}
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

SalesListView.displayName = "SalesListView";

export default SalesListView;
