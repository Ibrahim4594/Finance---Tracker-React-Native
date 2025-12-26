import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, AccessibilityRole } from 'react-native';

interface AccessibleTouchableProps extends TouchableOpacityProps {
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
}

/**
 * Accessible touchable component with proper ARIA attributes
 * Ensures screen reader compatibility and WCAG compliance
 */
export const AccessibleTouchable: React.FC<AccessibleTouchableProps> = ({
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  children,
  ...props
}) => {
  return (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

export default AccessibleTouchable;
