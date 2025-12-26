// Premium Professional Theme Configuration

// Light Theme Colors
export const LIGHT_COLORS = {
  // Primary Colors - Deep Navy
  primary: '#0D1B2A',
  primaryLight: '#1B263B',
  primaryDark: '#050A12',

  // Accent Colors - Elegant Gold
  accent: '#C9A227',
  accentLight: '#D4B55A',
  accentDark: '#A68A1F',

  // Secondary Accent - Soft Teal
  secondary: '#48A9A6',
  secondaryLight: '#6DBFBD',
  secondaryDark: '#3A8987',

  // Success & Error
  success: '#10B981',
  successLight: '#34D399',
  error: '#EF4444',
  errorLight: '#F87171',
  warning: '#F59E0B',

  // Background - Clean White/Off-white
  background: '#FAFBFC',
  backgroundDark: '#F1F3F4',
  surface: '#FFFFFF',
  surfaceLight: '#F8F9FA',
  surfaceElevated: '#FFFFFF',

  // Text - Professional Grays
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textMuted: '#D1D5DB',
  textInverse: '#FFFFFF',

  // Border & Shadow
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
  shadow: '#0D1B2A',

  // Gradients
  gradientStart: '#0D1B2A',
  gradientMiddle: '#1B263B',
  gradientEnd: '#415A77',

  // Accent Gradients (for Button component)
  accentGradientStart: '#D4B55A',
  accentGradientEnd: '#C9A227',

  // Card overlays
  overlay: 'rgba(13, 27, 42, 0.85)',
  overlayLight: 'rgba(13, 27, 42, 0.5)',
};

// Dark Theme Colors
export const DARK_COLORS = {
  // Primary Colors - Even Deeper Navy/Black
  primary: '#000000',
  primaryLight: '#1A1A1A',
  primaryDark: '#000000',

  // Accent Colors - Bright Gold (more vibrant in dark)
  accent: '#FFD700',
  accentLight: '#FFED4E',
  accentDark: '#E6C200',

  // Secondary Accent
  secondary: '#48A9A6',
  secondaryLight: '#6DBFBD',
  secondaryDark: '#3A8987',

  // Success & Error
  success: '#10B981',
  successLight: '#34D399',
  error: '#EF4444',
  errorLight: '#F87171',
  warning: '#F59E0B',

  // Background - Dark grays
  background: '#0A0A0A',
  backgroundDark: '#151515',
  surface: '#1A1A1A',
  surfaceLight: '#202020',
  surfaceElevated: '#252525',

  // Text - Light colors for dark background
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textLight: '#808080',
  textMuted: '#505050',
  textInverse: '#0A0A0A',

  // Border & Shadow
  border: '#2A2A2A',
  borderLight: '#353535',
  borderDark: '#1F1F1F',
  shadow: '#000000',

  // Gradients
  gradientStart: '#0A0A0A',
  gradientMiddle: '#1A1A1A',
  gradientEnd: '#2A2A2A',

  // Accent Gradients
  accentGradientStart: '#FFED4E',
  accentGradientEnd: '#FFD700',

  // Card overlays
  overlay: 'rgba(0, 0, 0, 0.9)',
  overlayLight: 'rgba(0, 0, 0, 0.7)',
};

// Default export (Light theme)
export const COLORS = LIGHT_COLORS;

export const TYPOGRAPHY = {
  // Font Families
  fontRegular: 'System',
  fontMedium: 'System',
  fontBold: 'System',
  fontMono: 'Courier',

  // Font Sizes - Refined Scale
  h1: 34,
  h2: 28,
  h3: 22,
  h4: 18,
  h5: 16,
  h6: 14,
  body: 15,
  bodySmall: 13,
  caption: 12,
  small: 11,
  micro: 10,

  // Line Heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,

  // Letter Spacing
  letterSpacingTight: -0.5,
  letterSpacingNormal: 0,
  letterSpacingWide: 0.5,
  letterSpacingWidest: 1.5,

  // Font Weights
  weightLight: '300' as const,
  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightSemiBold: '600' as const,
  weightBold: '700' as const,
  weightBlack: '800' as const,
};

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  elevated: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 10,
  },
};

export const LAYOUT = {
  screenPadding: SPACING.lg,
  cardPadding: SPACING.lg,
  headerHeight: 56,
  tabBarHeight: 64,
  inputHeight: 52,
  buttonHeight: 54,
};

// Premium Icon Set - Clean, Professional
export const ICONS = {
  // Navigation
  dashboard: '◎',
  transactions: '↗',
  budget: '◈',
  analytics: '◐',
  profile: '○',

  // Actions
  add: '+',
  edit: '✎',
  delete: '×',
  search: '⌕',
  filter: '≡',
  settings: '⚙',

  // Categories
  income: '↓',
  expense: '↑',
  food: '●',
  transport: '●',
  shopping: '●',
  bills: '●',
  entertainment: '●',
  health: '●',

  // Status
  success: '✓',
  warning: '!',
  error: '×',
  info: 'i',

  // Arrows
  arrowRight: '→',
  arrowLeft: '←',
  arrowUp: '↑',
  arrowDown: '↓',
  chevronRight: '›',
  chevronLeft: '‹',
};
