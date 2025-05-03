import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Material } from "../forms/MaterialForm";

interface MaterialListViewProps {
  materials: Material[];
  loading: boolean;
  onAddNew: () => void;
  onDelete: (id: number) => Promise<void>;
}

export const MaterialListView = React.memo(
  ({ materials, loading, onAddNew, onDelete }: MaterialListViewProps) => {
    const [deletingIds, setDeletingIds] = useState<number[]>([]);

    const handleDelete = async (id: number) => {
      try {
        setDeletingIds((prev) => [...prev, id]);
        await onDelete(id);
      } catch (error) {
        console.error(`Error deleting material ${id}:`, error);
      } finally {
        setDeletingIds((prev) => prev.filter((deletingId) => deletingId !== id));
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
            Add Material
          </Button>
        </div>

        <Card className="bg-white border border-gray-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-[80px] text-gray-700 font-semibold">
                    #
                  </TableHead>
                  <TableHead className="text-gray-700 font-semibold">
                    Name
                  </TableHead>
                  <TableHead className="w-[100px] text-gray-700 font-semibold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10">
                      <div className="flex justify-center items-center">
                        <div className="w-10 h-10 border-t-4 border-teal-500 border-solid rounded-full animate-spin"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : materials.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-6 text-gray-600"
                    >
                      No materials found. Click "Add Material" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  materials.map((material, index) => (
                    <TableRow
                      key={material.id}
                      className="hover:bg-gray-50 border-b border-gray-200"
                    >
                      <TableCell className="text-gray-800">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-gray-800">
                        {material.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(material.id)}
                          disabled={deletingIds.includes(material.id)}
                          title={`Delete (DB ID: ${material.id})`}
                        >
                          {deletingIds.includes(material.id) ? (
                            <div className="h-4 w-4 border-t-2 border-red-500 border-solid rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
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

MaterialListView.displayName = "MaterialListView";

export default MaterialListView;
