import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface TableWrapperProps {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
  loading?: boolean;
  loadingRows?: number;
  emptyMessage?: string;
  isEmpty?: boolean;
  searchTerm?: string;
}

/**
 * TableWrapper - A consistent container for data tables across the application
 * 
 * This component provides standardized styling and layout for all tables,
 * with support for loading states, empty states, and action buttons.
 */
export default function TableWrapper({
  children,
  title,
  actions,
  loading = false,
  loadingRows = 5,
  emptyMessage = 'No data found.',
  isEmpty = false,
  searchTerm = ''
}: TableWrapperProps) {
  return (
    <div className="w-full animate-fade-in">
      {(title || actions) && (
        <div className="mb-6 flex items-center justify-between">
          {title && <h2 className="text-2xl font-bold text-gray-800">{title}</h2>}
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      
      <Card className="bg-white border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <LoadingTable rows={loadingRows} />
          ) : isEmpty ? (
            <EmptyState 
              message={searchTerm ? `No results match "${searchTerm}".` : emptyMessage} 
            />
          ) : (
            children
          )}
        </div>
      </Card>
    </div>
  );
}

/**
 * LoadingTable - A skeleton loader for tables
 */
export function LoadingTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="p-6">
      <div className="space-y-4">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-8 w-32" />
          ))}
        </div>
        
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={`cell-${rowIndex}-${colIndex}`} 
                className={`h-6 ${colIndex === 0 ? 'w-20' : 'w-32'}`} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * EmptyState - A component for displaying empty table states
 */
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 px-6 text-center">
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

/**
 * TableHeader - A component for consistent table headers
 */
export function TableHeader({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-50 py-4 px-6 border-b border-gray-200 flex items-center justify-between">
      {children}
    </div>
  );
}

/**
 * DataTable - A styled table component
 */
export function DataTable({ children }: { children: ReactNode }) {
  return (
    <Table>
      {children}
    </Table>
  );
}

/**
 * StatusBadge - A component for displaying status badges
 */
export function StatusBadge({ 
  status, 
  colorMap = {
    'PENDING': 'bg-blue-100 text-blue-800',
    'CONFIRMED': 'bg-yellow-100 text-yellow-800',
    'DELIVERED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'ACTIVE': 'bg-green-100 text-green-800',
    'INACTIVE': 'bg-gray-100 text-gray-800',
  }
}: { 
  status: string; 
  colorMap?: Record<string, string>;
}) {
  const statusUppercase = status.toUpperCase();
  const colorClass = colorMap[statusUppercase] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
} 