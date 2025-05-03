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
import { Search, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

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

interface SalesOrderItem {
  id?: number;
  materialId: number;
  crusherSiteId?: number;
  qty: number;
  rate: number;
  uom: string;
  Material?: Material;
  CrusherSite?: {
    id: number;
    name: string;
    location: string;
  };
}

interface SalesOrder {
  id: number;
  customerId: number;
  vehicleNo?: string;
  challanNo?: string;
  address?: string;
  orderDate: string;
  createdAt?: string;
  updatedAt?: string;
  Customer?: Customer;
  SalesOrderItems?: SalesOrderItem[];
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
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    const toggleRowExpansion = (orderId: number) => {
      setExpandedRows(prev =>
        prev.includes(orderId)
          ? prev.filter(id => id !== orderId)
          : [...prev, orderId]
      );
    };

    const filteredSalesOrders =
      searchTerm.trim() === ""
        ? salesOrders
        : salesOrders.filter((order) => {
            const searchLower = searchTerm.toLowerCase();
            const customerName = order.Customer?.name?.toLowerCase() || "";
            const vehicleNo = order.vehicleNo?.toLowerCase() || "";
            const challanNo = order.challanNo?.toLowerCase() || "";
            
            // Also search in materials
            const materials = order.SalesOrderItems?.some(item => 
              item.Material?.name.toLowerCase().includes(searchLower)
            ) || false;

            return (
              customerName.includes(searchLower) ||
              vehicleNo.includes(searchLower) ||
              challanNo.includes(searchLower) ||
              materials
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
    
    // Calculate total amount for an order
    const calculateOrderTotal = (order: SalesOrder) => {
      return order.SalesOrderItems?.reduce((sum, item) => sum + (item.qty * (item.rate || 0)), 0) || 0;
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
            placeholder="Search by customer, material, vehicle number or challan number..."
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
                  <TableHead className="text-gray-700 font-semibold w-10"></TableHead>
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
                    Total Amount
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Vehicle
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Challan No.
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
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
                      colSpan={7}
                      className="h-24 text-center text-gray-600"
                    >
                      {searchTerm
                        ? "No matching sales orders found. Try a different search term."
                        : "No sales orders yet. Click 'Add Sale' to create one."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSalesOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <TableRow
                        className="hover:bg-gray-50 border-b border-gray-200 cursor-pointer"
                        onClick={() => toggleRowExpansion(order.id)}
                      >
                        <TableCell>
                          {expandedRows.includes(order.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-gray-800">
                          {order.id}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {formatDate(order.orderDate)}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {order.Customer?.name}
                        </TableCell>
                        <TableCell className="font-medium text-gray-800">
                          {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 2,
                          }).format(calculateOrderTotal(order))}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {order.vehicleNo || "—"}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {order.challanNo || "—"}
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded row with item details */}
                      {expandedRows.includes(order.id) && (
                        <TableRow className="bg-gray-50">
                          <TableCell colSpan={7} className="p-0">
                            <div className="p-4">
                              <h3 className="text-sm font-semibold mb-2">Items</h3>
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-100">
                                    <TableHead className="text-xs">Material</TableHead>
                                    <TableHead className="text-xs">Crusher Site</TableHead>
                                    <TableHead className="text-xs">Quantity</TableHead>
                                    <TableHead className="text-xs">Rate</TableHead>
                                    <TableHead className="text-xs">Amount</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.SalesOrderItems?.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell className="text-sm">
                                        {item.Material?.name || "—"}
                                      </TableCell>
                                      <TableCell className="text-sm">
                                        {item.CrusherSite?.name || "—"}
                                      </TableCell>
                                      <TableCell className="text-sm">
                                        {item.qty} {item.uom}
                                      </TableCell>
                                      <TableCell className="text-sm">
                                        {new Intl.NumberFormat("en-IN", {
                                          style: "currency",
                                          currency: "INR",
                                        }).format(item.rate)}
                                      </TableCell>
                                      <TableCell className="text-sm font-medium">
                                        {new Intl.NumberFormat("en-IN", {
                                          style: "currency",
                                          currency: "INR",
                                        }).format(item.qty * (item.rate || 0))}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              
                              {order.address && (
                                <div className="mt-3">
                                  <span className="text-sm font-semibold">Delivery Address: </span>
                                  <span className="text-sm">{order.address}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
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
