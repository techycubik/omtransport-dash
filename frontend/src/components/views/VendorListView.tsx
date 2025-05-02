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
import { Search, Edit, Trash2 } from "lucide-react";
import { Vendor } from "../forms/VendorForm";
import { Card } from "@/components/ui/card";

interface VendorListViewProps {
  vendors: Vendor[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
  onEdit: (vendor: Vendor) => void;
  onDelete: (id: number) => void;
}

export const VendorListView = React.memo(
  ({
    vendors,
    searchTerm,
    onSearchChange,
    onAddNew,
    onEdit,
    onDelete,
  }: VendorListViewProps) => {
    // Filter vendors based on search term
    const filteredVendors = vendors.filter(
      (vendor) =>
        vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.gstNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.state?.toLowerCase().includes(searchTerm.toLowerCase())
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
            Add Vendor
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search vendors by name, GST, contact..."
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
                {filteredVendors.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-gray-600"
                    >
                      {searchTerm
                        ? "No matching vendors found. Try a different search term."
                        : "No vendors found. Add your first vendor!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVendors.map((vendor) => (
                    <TableRow
                      key={vendor.id}
                      className="hover:bg-gray-50 border-b border-gray-200"
                    >
                      <TableCell className="font-medium text-gray-800">
                        {vendor.name}
                      </TableCell>
                      <TableCell className="text-gray-800">
                        {vendor.gstNo || "—"}
                      </TableCell>
                      <TableCell className="text-gray-800">
                        {vendor.contact || "—"}
                      </TableCell>
                      <TableCell className="text-gray-800 max-w-xs truncate">
                        <div>
                          {vendor.street && `${vendor.street}, `}
                          {vendor.city && `${vendor.city}, `}
                          {vendor.state && `${vendor.state}`}
                          {vendor.pincode && ` - ${vendor.pincode}`}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(vendor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(vendor.id)}
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

VendorListView.displayName = "VendorListView";

export default VendorListView;

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
