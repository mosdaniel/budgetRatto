/**
 * Design Tokens — single source of truth for all visual values.
 * Never use magic numbers or hardcoded colors outside this file.
 * If a value needs to change, change it here once.
 */

export const Colors = {
  bg:              '#191919',
  surface:         '#242424',
  surface2:        '#2c2c2c',
  surfaceHover:    '#2d2d2d',
  surfaceActive:   '#363636',
  border:          '#333333',
  borderSubtle:    '#272727',

  textPrimary:     '#ffffff',
  textSecondary:   '#9b9b9b',
  textTertiary:    '#666666',

  accent:          '#4f8ef7',
  accentHover:     '#6ba2ff',
  danger:          '#ef4444',
  dangerHover:     '#f87272',
  success:         '#10b981',
  warning:         '#f59e0b',

  // Chart palette — vibrant colors designed for dark backgrounds
  chart: [
    '#4f8ef7', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ],
}

export const Spacing = {
  xs:  '4px',
  sm:  '8px',
  md:  '16px',
  lg:  '24px',
  xl:  '32px',
  xxl: '48px',
}

export const Radius = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '24px',
}

export const Font = {
  family:  "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  weight: {
    light:    300,
    regular:  400,
    medium:   500,
    semibold: 600,
    bold:     700,
  },
  size: {
    xs:   '11px',
    sm:   '12px',
    md:   '14px',
    lg:   '16px',
    xl:   '20px',
    xxl:  '28px',
    xxxl: '36px',
  },
}

export const Shadow = {
  sm: '0 1px 4px rgba(0,0,0,0.3)',
  md: '0 4px 12px rgba(0,0,0,0.4)',
  lg: '0 8px 24px rgba(0,0,0,0.5)',
  xl: '0 16px 48px rgba(0,0,0,0.7)',
}
