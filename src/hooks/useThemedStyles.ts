import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TYPOGRAPHY, SPACING, RADIUS, LAYOUT } from '../constants/theme';

/**
 * Custom hook to create themed styles
 * Usage: const styles = useThemedStyles(createStyles);
 *
 * @param createStyles Function that receives colors and returns StyleSheet
 * @returns Themed StyleSheet object
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  createStyles: (colors: ReturnType<typeof useTheme>['colors']) => T
): T {
  const { colors } = useTheme();

  return useMemo(() => StyleSheet.create(createStyles(colors)), [colors, createStyles]);
}

// Export constants for convenience
export { TYPOGRAPHY, SPACING, RADIUS, LAYOUT };
