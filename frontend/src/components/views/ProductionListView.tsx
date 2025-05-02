import React, { useCallback } from "react";
import { format } from "date-fns";
import { Plus, Search, FileText } from "lucide-react";
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
import { CrusherRun } from "../forms/ProductionForm";

interface ProductionListViewProps {
  production: CrusherRun[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddNew: () => void;
  loading: boolean;
}

export const ProductionListView = React.memo(
  ({
    production,
    searchTerm,
    onSearchChange,
    onAddNew,
    loading,
  }: ProductionListViewProps) => {
    // Format date helper
    const formatDate = (dateString: string) => {
      try {
        return format(new Date(dateString), "PPP");
      } catch (error) {
        console.error("Error formatting date:", error);
        return dateString;
      }
    };

    // Calculate yield percentage
    const calculateYield = (inputQty: number, producedQty: number) => {
      if (inputQty <= 0) return 0;
      return Math.round((producedQty / inputQty) * 100);
    };

    // Filter production data based on search term
    const filteredProduction = searchTerm
      ? production.filter(
          (p) =>
            p.Material?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.Machine?.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : production;

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
              placeholder="Search by material or machine..."
              className="pl-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <Button onClick={onAddNew}>
            <Plus size={16} className="mr-2" />
            New Production Entry
          </Button>
        </div>

        <TableWrapper
          loading={loading}
          isEmpty={filteredProduction.length === 0}
          emptyMessage="No production data found."
          searchTerm={searchTerm}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Machine</TableHead>
                <TableHead>Input Qty</TableHead>
                <TableHead>Output Qty</TableHead>
                <TableHead>Yield %</TableHead>
                <TableHead>Dispatched</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProduction.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>{formatDate(run.runDate)}</TableCell>
                  <TableCell>{run.Material?.name || "Unknown"}</TableCell>
                  <TableCell>{run.Machine?.name || "Unknown"}</TableCell>
                  <TableCell>
                    {run.inputQty} {run.Material?.uom}
                  </TableCell>
                  <TableCell>
                    {run.producedQty} {run.Material?.uom}
                  </TableCell>
                  <TableCell>
                    {calculateYield(run.inputQty, run.producedQty)}%
                  </TableCell>
                  <TableCell>
                    {run.dispatchedQty} {run.Material?.uom}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={run.status} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500"
                    >
                      <FileText size={16} />
                    </Button>
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

ProductionListView.displayName = "ProductionListView";

export default ProductionListView;
