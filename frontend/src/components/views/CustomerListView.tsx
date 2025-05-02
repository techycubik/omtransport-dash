import React, { useCallback } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, SquareArrowOutUpRight } from "lucide-react";
import { Customer } from "../forms/CustomerForm";
import { Card } from "@/components/ui/card";

interface CustomerListViewProps {
  customers: Customer[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: number) => void;
}

export const CustomerListView = React.memo(
  ({
    customers,
    searchTerm,
    onSearchChange,
    onAddNew,
    onEdit,
    onDelete,
  }: CustomerListViewProps) => {
    // Filter customers based on search term
    const filteredCustomers = customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.gstNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.state?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Use a stable reference for the change handler
    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
      },
      [onSearchChange]
    );

    return (
      <>
        <div className="mb-6 flex items-center justify-between">
          <div></div>
          <Button
            className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white"
            onClick={onAddNew}
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers by name, GST, contact..."
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
                    Name
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    GST Number
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Contact
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Address
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold text-right pr-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-gray-600"
                    >
                      {searchTerm
                        ? "No matching customers found. Try a different search term."
                        : "No customers found. Add your first customer!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="hover:bg-gray-50 border-b border-gray-200"
                    >
                      <TableCell className="font-medium text-gray-800">
                        {customer.name}
                      </TableCell>
                      <TableCell className="text-gray-800">
                        {customer.gstNo || "—"}
                      </TableCell>
                      <TableCell className="text-gray-800">
                        {customer.contact || "—"}
                      </TableCell>
                      <TableCell className="text-gray-800 max-w-xs truncate">
                        <div>
                          {customer.street && `${customer.street}, `}
                          {customer.city && `${customer.city}, `}
                          {customer.state && `${customer.state}`}
                          {customer.pincode && ` - ${customer.pincode}`}
                        </div>
                        {customer.maps_link && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-1 text-xs"
                            onClick={() =>
                              window.open(customer.maps_link, "_blank")
                            }
                          >
                            <SquareArrowOutUpRight className="h-3 w-3 mr-1" />
                            View on Maps
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(customer.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

CustomerListView.displayName = "CustomerListView";

export default CustomerListView;

// Add the Plus icon that was missing
const Plus = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);
