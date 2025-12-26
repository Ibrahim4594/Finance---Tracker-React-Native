import React, { useState, useEffect, useCallback } from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Text } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../constants/theme';

interface DebouncedInputProps extends Omit<TextInputProps, 'onChangeText'> {
  onChangeText: (text: string) => void;
  debounceMs?: number;
  label?: string;
  error?: string;
  containerStyle?: any;
}

/**
 * Text input component with built-in debouncing
 * Useful for search fields and real-time validation
 *
 * @param onChangeText - Callback fired after debounce delay
 * @param debounceMs - Delay in milliseconds (default: 300ms)
 * @param label - Optional label above input
 * @param error - Error message to display below input
 */
export const DebouncedInput: React.FC<DebouncedInputProps> = ({
  onChangeText,
  debounceMs = 300,
  label,
  error,
  containerStyle,
  value: externalValue,
  ...textInputProps
}) => {
  const [internalValue, setInternalValue] = useState(externalValue || '');

  // Update internal value when external value changes
  useEffect(() => {
    setInternalValue(externalValue || '');
  }, [externalValue]);

  // Debounced onChange handler
  useEffect(() => {
    const handler = setTimeout(() => {
      if (internalValue !== externalValue) {
        onChangeText(internalValue);
      }
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [internalValue, debounceMs, onChangeText, externalValue]);

  const handleChangeText = useCallback((text: string) => {
    setInternalValue(text);
  }, []);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        {...textInputProps}
        value={internalValue}
        onChangeText={handleChangeText}
        style={[
          styles.input,
          error && styles.inputError,
          textInputProps.style,
        ]}
        placeholderTextColor={textInputProps.placeholderTextColor || COLORS.textLight}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.bodySmall,
    fontWeight: TYPOGRAPHY.weightMedium,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.text,
    ...SHADOWS.small,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: SPACING.xxs,
  },
});

export default DebouncedInput;
