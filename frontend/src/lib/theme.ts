import { rgbVar } from './utils';

/**
 * Theme utilities for consistent styling across the application
 */
export const theme = {
  colors: {
    primary: {
      50: () => rgbVar('primary-50'),
      100: () => rgbVar('primary-100'),
      200: () => rgbVar('primary-200'),
      300: () => rgbVar('primary-300'),
      400: () => rgbVar('primary-400'),
      500: () => rgbVar('primary-500'),
      600: () => rgbVar('primary-600'),
      700: () => rgbVar('primary-700'),
      800: () => rgbVar('primary-800'),
      900: () => rgbVar('primary-900'),
      950: () => rgbVar('primary-950'),
    },
    neutral: {
      50: () => rgbVar('neutral-50'),
      100: () => rgbVar('neutral-100'),
      200: () => rgbVar('neutral-200'),
      300: () => rgbVar('neutral-300'),
      400: () => rgbVar('neutral-400'),
      500: () => rgbVar('neutral-500'),
      600: () => rgbVar('neutral-600'),
      700: () => rgbVar('neutral-700'),
      800: () => rgbVar('neutral-800'),
      900: () => rgbVar('neutral-900'),
      950: () => rgbVar('neutral-950'),
    },
    success: {
      50: () => rgbVar('success-50'),
      500: () => rgbVar('success-500'),
      600: () => rgbVar('success-600'),
    },
    warning: {
      50: () => rgbVar('warning-50'),
      500: () => rgbVar('warning-500'),
      600: () => rgbVar('warning-600'),
    },
    error: {
      50: () => rgbVar('error-50'),
      500: () => rgbVar('error-500'),
      600: () => rgbVar('error-600'),
    },
    background: () => rgbVar('background'),
    foreground: () => rgbVar('foreground'),
    card: () => rgbVar('card'),
    cardForeground: () => rgbVar('card-foreground'),
    border: () => rgbVar('border'),
    input: () => rgbVar('input'),
    ring: () => rgbVar('ring'),
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  radii: {
    sm: 'var(--radius-sm)',
    base: 'var(--radius)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    full: 'var(--radius-full)',
  },
  
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  shadows: {
    sm: 'var(--shadow-sm)',
    base: 'var(--shadow)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
  },
  
  transitions: {
    short: 'var(--transition-short)',
    default: 'var(--transition-default)',
    long: 'var(--transition-long)',
  },
}; 