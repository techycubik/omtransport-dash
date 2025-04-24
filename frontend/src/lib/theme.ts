import { rgbVar } from './utils';

/**
 * Theme utilities for the OM Transport construction dashboard
 */
export const theme = {
  colors: {
    navy: {
      50: () => rgbVar('navy-50'),
      100: () => rgbVar('navy-100'),
      200: () => rgbVar('navy-200'),
      300: () => rgbVar('navy-300'),
      400: () => rgbVar('navy-400'),
      500: () => rgbVar('navy-500'), // Main navy blue #0A3054
      600: () => rgbVar('navy-600'),
      700: () => rgbVar('navy-700'),
      800: () => rgbVar('navy-800'),
      900: () => rgbVar('navy-900'),
    },
    yellow: {
      50: () => rgbVar('yellow-50'),
      100: () => rgbVar('yellow-100'),
      200: () => rgbVar('yellow-200'),
      300: () => rgbVar('yellow-300'),
      400: () => rgbVar('yellow-400'), // Construction yellow #FFCC00
      500: () => rgbVar('yellow-500'),
      600: () => rgbVar('yellow-600'),
      700: () => rgbVar('yellow-700'),
      800: () => rgbVar('yellow-800'),
      900: () => rgbVar('yellow-900'),
    },
    steel: {
      50: () => rgbVar('steel-50'),
      100: () => rgbVar('steel-100'),
      200: () => rgbVar('steel-200'),
      300: () => rgbVar('steel-300'),
      400: () => rgbVar('steel-400'),
      500: () => rgbVar('steel-500'), // Steel gray #465662
      600: () => rgbVar('steel-600'),
      700: () => rgbVar('steel-700'),
      800: () => rgbVar('steel-800'),
      900: () => rgbVar('steel-900'),
    },
    concrete: {
      50: () => rgbVar('concrete-50'),
      100: () => rgbVar('concrete-100'),
      200: () => rgbVar('concrete-200'),
      300: () => rgbVar('concrete-300'),
      400: () => rgbVar('concrete-400'), // Concrete gray #D0D0D0
      500: () => rgbVar('concrete-500'),
      600: () => rgbVar('concrete-600'),
      700: () => rgbVar('concrete-700'),
      800: () => rgbVar('concrete-800'),
      900: () => rgbVar('concrete-900'),
    },
    brown: {
      50: () => rgbVar('brown-50'),
      100: () => rgbVar('brown-100'),
      200: () => rgbVar('brown-200'),
      300: () => rgbVar('brown-300'),
      400: () => rgbVar('brown-400'),
      500: () => rgbVar('brown-500'), // Earth brown #8B572A
      600: () => rgbVar('brown-600'),
      700: () => rgbVar('brown-700'),
      800: () => rgbVar('brown-800'),
      900: () => rgbVar('brown-900'),
    },
    orange: {
      50: () => rgbVar('orange-50'),
      100: () => rgbVar('orange-100'),
      200: () => rgbVar('orange-200'),
      300: () => rgbVar('orange-300'),
      400: () => rgbVar('orange-400'),
      500: () => rgbVar('orange-500'), // Safety orange #FF5500
      600: () => rgbVar('orange-600'),
      700: () => rgbVar('orange-700'),
      800: () => rgbVar('orange-800'),
      900: () => rgbVar('orange-900'),
    },
    success: {
      50: () => rgbVar('success-50'),
      100: () => rgbVar('success-100'),
      200: () => rgbVar('success-200'),
      300: () => rgbVar('success-300'),
      400: () => rgbVar('success-400'),
      500: () => rgbVar('success-500'), // Success green #2E8B57
      600: () => rgbVar('success-600'),
      700: () => rgbVar('success-700'),
      800: () => rgbVar('success-800'),
      900: () => rgbVar('success-900'),
    },
    error: {
      50: () => rgbVar('error-50'),
      100: () => rgbVar('error-100'),
      200: () => rgbVar('error-200'),
      300: () => rgbVar('error-300'),
      400: () => rgbVar('error-400'),
      500: () => rgbVar('error-500'), // Alert red #D22B2B
      600: () => rgbVar('error-600'),
      700: () => rgbVar('error-700'),
      800: () => rgbVar('error-800'),
      900: () => rgbVar('error-900'),
    },
    // System colors
    primary: () => rgbVar('primary'),
    primaryForeground: () => rgbVar('primary-foreground'),
    secondary: () => rgbVar('secondary'),
    secondaryForeground: () => rgbVar('secondary-foreground'),
    accent: () => rgbVar('accent'),
    accentForeground: () => rgbVar('accent-foreground'),
    background: () => rgbVar('background'),
    foreground: () => rgbVar('foreground'),
    card: () => rgbVar('card'),
    cardForeground: () => rgbVar('card-foreground'),
    muted: () => rgbVar('muted'),
    mutedForeground: () => rgbVar('muted-foreground'),
    border: () => rgbVar('border'),
    input: () => rgbVar('input'),
    ring: () => rgbVar('ring'),
  },
  
  // 8px grid system as per guidelines
  spacing: {
    1: 'var(--space-1)',   // 4px
    2: 'var(--space-2)',   // 8px
    3: 'var(--space-3)',   // 16px
    4: 'var(--space-4)',   // 24px
    5: 'var(--space-5)',   // 32px
    6: 'var(--space-6)',   // 48px
  },
  
  radii: {
    sm: 'var(--radius-sm)',
    base: 'var(--radius)',  // 8px rounded corners per guidelines
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    full: 'var(--radius-full)',
  },
  
  fontSizes: {
    xs: 'var(--font-size-xs)',    // 12px - small text/footnotes
    sm: 'var(--font-size-sm)',    // 14px - body text
    base: 'var(--font-size-base)', // 16px - body text
    lg: 'var(--font-size-lg)',    // 18px - subheaders
    xl: 'var(--font-size-xl)',    // 22px - subheaders
    '2xl': 'var(--font-size-2xl)', // 24px - headers
    '3xl': 'var(--font-size-3xl)', // 32px - headers
  },
  
  fontWeights: {
    regular: 'var(--font-weight-regular)', // 400
    medium: 'var(--font-weight-medium)',   // 500
    bold: 'var(--font-weight-bold)',      // 700
  },
  
  fonts: {
    primary: 'var(--font-primary)',   // Roboto
    secondary: 'var(--font-secondary)', // Open Sans
    mono: 'var(--font-mono)',
  },
  
  shadows: {
    sm: 'var(--shadow-sm)',
    base: 'var(--shadow)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
  },
  
  transitions: {
    short: 'var(--transition-short)',     // 150ms
    default: 'var(--transition-default)', // 250ms
    long: 'var(--transition-long)',       // 350ms
  },
}; 