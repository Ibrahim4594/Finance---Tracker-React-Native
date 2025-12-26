import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export interface ReceiptImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  allowsEditing?: boolean;
}

export interface ReceiptImageResult {
  uri: string;
  width: number;
  height: number;
  size: number; // in bytes
  base64?: string;
}

const DEFAULT_OPTIONS: Required<ReceiptImageOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  allowsEditing: false,
};

/**
 * Requests camera permissions from the user
 * @returns true if permission granted, false otherwise
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera access to take receipt photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

/**
 * Requests media library permissions from the user
 * @returns true if permission granted, false otherwise
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Media Library Permission Required',
        'Please allow media library access to select receipt photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error requesting media library permission:', error);
    return false;
  }
};

/**
 * Compresses and resizes an image for optimal storage
 * @param uri - The URI of the image to process
 * @param options - Compression options
 * @returns Processed image result
 */
const processImage = async (
  uri: string,
  options: ReceiptImageOptions = {}
): Promise<ReceiptImageResult> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Manipulate image: resize and compress
    const manipResult = await manipulateAsync(
      uri,
      [
        {
          resize: {
            width: opts.maxWidth,
            height: opts.maxHeight,
          },
        },
      ],
      {
        compress: opts.quality,
        format: SaveFormat.JPEG,
      }
    );

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(manipResult.uri);
    const size = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

    return {
      uri: manipResult.uri,
      width: manipResult.width,
      height: manipResult.height,
      size,
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process receipt image');
  }
};

/**
 * Takes a photo of a receipt using the device camera
 * @param options - Image processing options
 * @returns Receipt image result or null if cancelled
 */
export const takeReceiptPhoto = async (
  options: ReceiptImageOptions = {}
): Promise<ReceiptImageResult | null> => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    return null;
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing ?? DEFAULT_OPTIONS.allowsEditing,
      quality: 1, // Use high quality for initial capture, compress later
      exif: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return await processImage(asset.uri, options);
  } catch (error) {
    console.error('Error taking receipt photo:', error);
    Alert.alert('Error', 'Failed to take receipt photo. Please try again.');
    return null;
  }
};

/**
 * Selects a receipt image from the device gallery
 * @param options - Image processing options
 * @returns Receipt image result or null if cancelled
 */
export const selectReceiptImage = async (
  options: ReceiptImageOptions = {}
): Promise<ReceiptImageResult | null> => {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) {
    return null;
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing ?? DEFAULT_OPTIONS.allowsEditing,
      quality: 1, // Use high quality for initial selection, compress later
      exif: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    return await processImage(asset.uri, options);
  } catch (error) {
    console.error('Error selecting receipt image:', error);
    Alert.alert('Error', 'Failed to select receipt image. Please try again.');
    return null;
  }
};

/**
 * Shows an action sheet to choose between camera and gallery
 * @param options - Image processing options
 * @returns Receipt image result or null if cancelled
 */
export const selectReceiptImageSource = async (
  options: ReceiptImageOptions = {}
): Promise<ReceiptImageResult | null> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Add Receipt Photo',
      'Choose how to add your receipt image',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const result = await takeReceiptPhoto(options);
            resolve(result);
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const result = await selectReceiptImage(options);
            resolve(result);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
};

/**
 * Deletes a receipt image from the file system
 * @param uri - The URI of the image to delete
 * @returns true if deleted successfully
 */
export const deleteReceiptImage = async (uri: string): Promise<boolean> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting receipt image:', error);
    return false;
  }
};

/**
 * Converts an image to base64 string for storage or upload
 * @param uri - The URI of the image
 * @returns Base64 string or null if failed
 */
export const imageToBase64 = async (uri: string): Promise<string | null> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

/**
 * Gets the size of an image file in bytes
 * @param uri - The URI of the image
 * @returns Size in bytes or 0 if failed
 */
export const getImageSize = async (uri: string): Promise<number> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;
  } catch (error) {
    console.error('Error getting image size:', error);
    return 0;
  }
};

/**
 * Formats file size in human-readable format
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validates if a URI is a valid image
 * @param uri - The URI to validate
 * @returns true if valid image URI
 */
export const isValidImageUri = async (uri: string): Promise<boolean> => {
  if (!uri) return false;

  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) return false;

    // Check if it's an image based on URI
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const hasImageExtension = imageExtensions.some((ext) =>
      uri.toLowerCase().endsWith(ext)
    );

    return hasImageExtension;
  } catch (error) {
    console.error('Error validating image URI:', error);
    return false;
  }
};

/**
 * Creates a copy of an image file (useful for creating backups)
 * @param sourceUri - The source image URI
 * @param destinationUri - The destination URI
 * @returns true if copied successfully
 */
export const copyReceiptImage = async (
  sourceUri: string,
  destinationUri: string
): Promise<boolean> => {
  try {
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri,
    });
    return true;
  } catch (error) {
    console.error('Error copying receipt image:', error);
    return false;
  }
};

/**
 * Gets metadata about a receipt image
 * @param uri - The image URI
 * @returns Image metadata or null if failed
 */
export const getReceiptImageMetadata = async (
  uri: string
): Promise<{ size: number; exists: boolean; modificationTime?: number } | null> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      return { size: 0, exists: false };
    }

    return {
      size: 'size' in fileInfo ? fileInfo.size : 0,
      exists: fileInfo.exists,
      modificationTime:
        'modificationTime' in fileInfo ? fileInfo.modificationTime : undefined,
    };
  } catch (error) {
    console.error('Error getting receipt image metadata:', error);
    return null;
  }
};

export default {
  requestCameraPermission,
  requestMediaLibraryPermission,
  takeReceiptPhoto,
  selectReceiptImage,
  selectReceiptImageSource,
  deleteReceiptImage,
  imageToBase64,
  getImageSize,
  formatFileSize,
  isValidImageUri,
  copyReceiptImage,
  getReceiptImageMetadata,
};
