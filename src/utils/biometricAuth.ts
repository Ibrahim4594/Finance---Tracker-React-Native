import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

/**
 * Check if biometric authentication is available on the device
 */
export const isBiometricAvailable = async (): Promise<boolean> => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      return false;
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return false;
  }
};

/**
 * Get the type of biometric authentication available
 */
export const getBiometricType = async (): Promise<string> => {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }

    return 'Biometric';
  } catch (error) {
    console.error('Error getting biometric type:', error);
    return 'Biometric';
  }
};

/**
 * Authenticate user using biometrics
 */
export const authenticateWithBiometrics = async (): Promise<boolean> => {
  try {
    const available = await isBiometricAvailable();

    if (!available) {
      Alert.alert(
        'Biometric Not Available',
        'Biometric authentication is not available on this device or not enrolled.'
      );
      return false;
    }

    const biometricType = await getBiometricType();

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Authenticate with ${biometricType}`,
      fallbackLabel: 'Use Passcode',
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
    });

    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    Alert.alert('Authentication Error', 'Failed to authenticate. Please try again.');
    return false;
  }
};

/**
 * Prompt user to enable biometric authentication
 */
export const promptEnableBiometric = async (
  onSuccess: () => void,
  onCancel?: () => void
): Promise<void> => {
  const available = await isBiometricAvailable();
  const biometricType = await getBiometricType();

  if (!available) {
    Alert.alert(
      'Biometric Not Available',
      'Biometric authentication is not available on this device. Please enable it in your device settings first.',
      [{ text: 'OK', onPress: onCancel }]
    );
    return;
  }

  Alert.alert(
    `Enable ${biometricType}`,
    `Would you like to enable ${biometricType} authentication for quick and secure access to your finance data?`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Enable',
        onPress: async () => {
          const authenticated = await authenticateWithBiometrics();
          if (authenticated) {
            onSuccess();
          } else {
            onCancel?.();
          }
        },
      },
    ]
  );
};
