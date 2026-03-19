// Ceres Liner Branding Theme - Yellow Dominant
export const CERES_COLORS = {
  // Primary Brand Colors
  primary: '#FFEB3B',        // Bright Yellow (Dominant)
  primaryDark: '#FDD835',    // Dark Yellow
  primaryLight: '#FFFF8D',   // Light Yellow
  
  // Neutral Colors
  background: '#121212',     // Dark Background
  surface: '#1E1E1E',        // Slightly lighter surface
  surfaceLight: '#2A2A2A',   // Even lighter surface
  text: '#FFFFFF',           // White text
  textSecondary: '#B0B0B0',  // Gray text
  textTernary: '#808080',    // Dark gray text
  
  // Accent Colors
  accent: '#000000',         // Black accent
  success: '#4CAF50',        // Green
  warning: '#FFC107',        // Amber
  error: '#F44336',          // Red
  info: '#2196F3',           // Blue
  
  // Borders & Dividers
  border: '#333333',
  divider: '#404040',
  
  // Status Colors
  active: '#4CAF50',
  inactive: '#757575',
  pending: '#FF9800',
};

export const CERES_TYPOGRAPHY = {
  headerLarge: {
    fontSize: 28,
    fontWeight: 'bold',
    color: CERES_COLORS.text,
  },
  headerMedium: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CERES_COLORS.text,
  },
  headerSmall: {
    fontSize: 18,
    fontWeight: '600',
    color: CERES_COLORS.text,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '500',
    color: CERES_COLORS.text,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    color: CERES_COLORS.text,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    color: CERES_COLORS.textSecondary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: CERES_COLORS.text,
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: 11,
    fontWeight: '400',
    color: CERES_COLORS.textTernary,
  },
};

export const CERES_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const CERES_BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const CERES_SHADOWS = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 8.84,
    elevation: 8,
  },
};
