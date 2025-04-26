/**
 * Shared styles and constants for consistent UI across the application
 */

// Form styles
export const formStyles = {
  // Input field classes
  input: "p-3 text-base bg-white text-gray-800 border border-gray-300 rounded-md placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition duration-200",
  
  // Label classes
  label: "block mb-2 text-sm font-medium text-gray-800",
  
  // Form control wrapper
  controlWrapper: "mb-4",
  
  // Form error message
  errorMessage: "mt-1 text-xs text-red-600",
  
  // Select dropdown
  select: "p-3 text-base bg-white text-gray-800 border border-gray-300 rounded-md w-full",
  
  // Form section title
  sectionTitle: "text-lg font-semibold text-gray-800 mb-4",
};

// Table styles
export const tableStyles = {
  // Table container
  container: "overflow-x-auto border border-gray-200 rounded-md",
  
  // Table itself
  table: "w-full",
  
  // Header row
  headerRow: "bg-gray-50 border-b border-gray-200",
  
  // Header cell
  headerCell: "p-4 text-left text-sm font-semibold text-gray-700",
  
  // Body row
  row: "border-b border-gray-200 hover:bg-gray-50",
  
  // Body row - for striped tables
  stripedRow: (index: number) => 
    index % 2 === 0 
      ? "border-b border-gray-200 bg-white hover:bg-gray-50" 
      : "border-b border-gray-200 bg-gray-50 hover:bg-gray-100",
  
  // Body cell
  cell: "p-4 text-sm text-gray-800",
  
  // Empty state
  emptyState: "p-6 text-center text-gray-600",
};

// Button styles
export const buttonStyles = {
  // Primary button
  primary: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200",
  
  // Secondary button
  secondary: "bg-white hover:bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded-md border border-gray-300 transition duration-200",
  
  // Outline button
  outline: "bg-transparent hover:bg-gray-100 text-blue-600 font-medium py-2 px-4 rounded-md border border-blue-200 transition duration-200",
  
  // Danger button
  danger: "bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200",
  
  // Icon button
  icon: "p-2 rounded-full hover:bg-gray-100 text-gray-600 transition duration-200",
  
  // Disabled state
  disabled: "opacity-50 cursor-not-allowed",
};

// Card styles
export const cardStyles = {
  // Card container
  container: "bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm",
  
  // Card header
  header: "px-6 py-4 border-b border-gray-200 bg-white",
  
  // Card title
  title: "text-xl font-semibold text-gray-800",
  
  // Card body
  body: "p-6",
  
  // Card footer
  footer: "px-6 py-4 border-t border-gray-200 bg-gray-50",
};

// Layout helpers
export const layoutStyles = {
  // Page container
  pageContainer: "p-6 bg-white min-h-screen",
  
  // Flex row with spacing
  flexRow: "flex items-center gap-4",
  
  // Flex column with spacing
  flexColumn: "flex flex-col gap-4",
  
  // Grid with responsive columns
  grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  
  // Section with bottom margin
  section: "mb-8",
};

// Status badges
export const statusBadges = {
  // Success badge (green)
  success: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800",
  
  // Warning badge (yellow)
  warning: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800",
  
  // Error badge (red)
  error: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800",
  
  // Info badge (blue)
  info: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800",
  
  // Neutral badge (gray)
  neutral: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800",
};

// Text styles
export const textStyles = {
  // Page title
  pageTitle: "text-2xl font-bold text-gray-800 mb-6",
  
  // Section title
  sectionTitle: "text-xl font-semibold text-gray-800 mb-4",
  
  // Card title
  cardTitle: "text-lg font-semibold text-gray-800",
  
  // Body text
  body: "text-sm text-gray-800",
  
  // Small text
  small: "text-xs text-gray-600",
  
  // Muted text
  muted: "text-sm text-gray-500",
};

// Helper function to combine classes
export function cn(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Helper function for conditional classes
export function classIf(condition: boolean, className: string): string {
  return condition ? className : '';
}

// Status mapping
export const statusColors = {
  'PENDING': 'bg-blue-100 text-blue-800',
  'CONFIRMED': 'bg-yellow-100 text-yellow-800',
  'DELIVERED': 'bg-green-100 text-green-800',
  'CANCELLED': 'bg-red-100 text-red-800',
  'RECEIVED': 'bg-green-100 text-green-800',
  'PARTIAL': 'bg-yellow-100 text-yellow-800',
};

// Default spacing values
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
};

// Common shadows
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow',
  lg: 'shadow-lg',
};

// Form field styles creator
export function createFormField(label: string, required: boolean = false) {
  return {
    label: `${label}${required ? ' *' : ''}`,
    labelClass: formStyles.label,
    inputClass: formStyles.input,
    errorClass: formStyles.errorMessage,
    wrapperClass: formStyles.controlWrapper,
  };
}

// Create button with proper styling
export function createButton(variant: 'primary' | 'secondary' | 'outline' | 'danger' = 'primary', disabled: boolean = false) {
  return {
    className: `${buttonStyles[variant]} ${disabled ? buttonStyles.disabled : ''}`,
  };
}

// Export default configuration for the entire UI
export default {
  form: formStyles,
  table: tableStyles,
  button: buttonStyles,
  card: cardStyles,
  layout: layoutStyles,
  status: statusBadges,
  text: textStyles,
}; 