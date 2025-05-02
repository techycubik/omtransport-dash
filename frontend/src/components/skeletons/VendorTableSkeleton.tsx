import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const VendorTableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-40" />
    </div>

    <div className="bg-white rounded-md border border-gray-200">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Name
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              GST Number
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Contact
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Address
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index} className="border-t border-gray-200">
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="px-6 py-4">
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default VendorTableSkeleton;
