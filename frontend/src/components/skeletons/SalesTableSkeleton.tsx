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

const SalesTableSkeleton = () => (
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
              ID
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Date
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Customer
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Material
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quantity
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Rate
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Amount
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Vehicle
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index} className="border-t border-gray-200">
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-4 w-12" />
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <Skeleton className="h-4 w-20" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default SalesTableSkeleton;
