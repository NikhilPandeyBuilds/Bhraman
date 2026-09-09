// Bhraman Design System & Color Palette
// Rich, adventurous Indian urban aesthetic (Saffron warmth, deep midnight indigo, terracotta, jade trust)

export const THEME = {
  colors: {
    primary: '#E65100',       // Saffron / Warm Terracotta
    primaryLight: '#FFF3E0',  // Warm tint
    primaryDark: '#BF360C',   // Deep rust
    secondary: '#00897B',     // Deep Jade / Authenticity Green
    secondaryLight: '#E0F2F1',
    accent: '#F57C00',        // Vibrant Marigold
    background: '#0F141C',    // Sleek Midnight Dark Mode
    surface: '#1A212D',       // Dark Card Surface
    surfaceElevated: '#242D3D',
    surfaceBorder: '#2E3A4D',
    textPrimary: '#F1F5F9',   // Crisp white
    textSecondary: '#94A3B8', // Cool grey
    textMuted: '#64748B',
    danger: '#EF4444',        // Red warning
    dangerLight: '#FEE2E2',
    error: '#EF4444',
    warning: '#F59E0B',       // Amber traffic
    warningLight: '#FEF3C7',
    success: '#10B981',       // Emerald buffer
    successLight: '#D1FAE5',
    sponsoredBadge: '#8B5CF6',// Purple for clearly labelled sponsored
    sponsoredBg: '#2E1065',
    verifiedBadge: '#0D9488', // Teal for community verified
    cardShadow: 'rgba(0, 0, 0, 0.4)',
  },
  typography: {
    fontTitle: 'System',
    weightBold: '700' as const,
    weightSemiBold: '600' as const,
    weightMedium: '500' as const,
    weightRegular: '400' as const,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
  }
};
