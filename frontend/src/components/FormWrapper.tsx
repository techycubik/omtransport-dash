import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface FormWrapperProps {
  children: ReactNode;
  title: string;
  onBackClick?: () => void;
  isEditing?: boolean;
  showBackButton?: boolean;
}

/**
 * FormWrapper - A consistent container for forms across the application
 * 
 * This component provides a standardized layout and styling for all forms,
 * ensuring consistent spacing, typography, and visual hierarchy.
 */
export default function FormWrapper({
  children,
  title,
  onBackClick,
  isEditing = false,
  showBackButton = true
}: FormWrapperProps) {
  return (
    <div className="w-full animate-fade-in">
      <div className="mb-6 flex items-center">
        {showBackButton && onBackClick && (
          <Button 
            variant="ghost" 
            onClick={onBackClick}
            className="mr-3 text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-gray-800" />
            <span className="text-gray-800">Back</span>
          </Button>
        )}
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditing ? `Edit ${title}` : `Add New ${title}`}
        </h2>
      </div>
      
      <Card className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        {children}
      </Card>
    </div>
  );
}

/**
 * FormSection - A component for grouping related form fields
 */
export function FormSection({ 
  children, 
  title 
}: { 
  children: ReactNode; 
  title: string 
}) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

/**
 * FormActions - A component for form action buttons with consistent alignment
 */
export function FormActions({ 
  children, 
  align = 'end' 
}: { 
  children: ReactNode; 
  align?: 'start' | 'center' | 'end' 
}) {
  return (
    <div className={`flex justify-${align} items-center gap-3 pt-6 border-t border-gray-100 mt-6`}>
      {children}
    </div>
  );
}

/**
 * FormGrid - A responsive grid layout for form fields
 */
export function FormGrid({ 
  children, 
  columns = 2 
}: { 
  children: ReactNode; 
  columns?: 1 | 2 | 3 | 4 
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {children}
    </div>
  );
}

/**
 * FormRow - A component for displaying form fields in a row
 */
export function FormRow({ 
  children 
}: { 
  children: ReactNode 
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {children}
    </div>
  );
}

/**
 * FormDivider - A visual separator for form sections
 */
export function FormDivider({ 
  className = '' 
}: { 
  className?: string 
}) {
  return (
    <div className={`border-t border-gray-200 my-6 ${className}`}></div>
  );
} 