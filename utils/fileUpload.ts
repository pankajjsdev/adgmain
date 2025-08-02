import { uploadFile } from '@/api';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface FileUploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  error?: string;
}

export interface UploadProgress {
  progress: number;
  isUploading: boolean;
}

// File type configurations
export const FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALL: ['*/*'],
} as const;

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Pick document from device
export const pickDocument = async (allowedTypes: string[] = [...FILE_TYPES.ALL]): Promise<DocumentPicker.DocumentPickerResult> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: allowedTypes,
      copyToCacheDirectory: true,
      multiple: false,
    });

    return result;
  } catch (error) {
    console.error('Error picking document:', error);
    throw new Error('Failed to pick document');
  }
};

// Pick image from camera or gallery
export const pickImage = async (source: 'camera' | 'gallery' = 'gallery'): Promise<ImagePicker.ImagePickerResult> => {
  try {
    // Request permissions
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        throw new Error('Camera permission denied');
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery permission is required to select photos.');
        throw new Error('Gallery permission denied');
      }
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    };

    const result = source === 'camera' 
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    return result;
  } catch (error) {
    console.error('Error picking image:', error);
    throw new Error('Failed to pick image');
  }
};

// Validate file size
export const validateFileSize = (fileSize: number): boolean => {
  return fileSize <= MAX_FILE_SIZE;
};

// Get file extension from URI
export const getFileExtension = (uri: string): string => {
  const parts = uri.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

// Get MIME type from file extension
export const getMimeType = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
  };

  return mimeTypes[extension] || 'application/octet-stream';
};

// Upload file to server
export const uploadFileToServer = async (
  file: {
    uri: string;
    name: string;
    type?: string;
    size?: number;
  },
  endpoint: string = '/student/upload/file',
  additionalData?: Record<string, any>,
  onProgress?: (progress: UploadProgress) => void
): Promise<FileUploadResult> => {
  try {
    // Validate file size if provided
    if (file.size && !validateFileSize(file.size)) {
      return {
        success: false,
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
      };
    }

    // Determine file type if not provided
    let fileType = file.type;
    if (!fileType) {
      const extension = getFileExtension(file.uri);
      fileType = getMimeType(extension);
    }

    const fileToUpload = {
      uri: file.uri,
      name: file.name,
      type: fileType,
    };

    // Start upload with progress tracking
    if (onProgress) {
      onProgress({ progress: 0, isUploading: true });
    }

    const response = await uploadFile(
      endpoint,
      fileToUpload,
      additionalData,
      (progress) => {
        if (onProgress) {
          onProgress({ progress, isUploading: true });
        }
      }
    );

    if (onProgress) {
      onProgress({ progress: 100, isUploading: false });
    }

    return {
      success: true,
      fileUrl: response.data.fileUrl || response.data.url,
      fileName: response.data.fileName || file.name,
      fileType: fileType,
    };
  } catch (error: any) {
    if (onProgress) {
      onProgress({ progress: 0, isUploading: false });
    }

    return {
      success: false,
      error: error.message || 'Failed to upload file',
    };
  }
};

// Upload assignment file
export const uploadAssignmentFile = async (
  assignmentId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<FileUploadResult> => {
  try {
    // Show file picker options
    const result = await new Promise<FileUploadResult>((resolve) => {
      Alert.alert(
        'Upload File',
        'Choose file source',
        [
          {
            text: 'Camera',
            onPress: async () => {
              try {
                const imageResult = await pickImage('camera');
                if (!imageResult.canceled && imageResult.assets?.[0]) {
                  const asset = imageResult.assets[0];
                  const uploadResult = await uploadFileToServer(
                    {
                      uri: asset.uri,
                      name: `assignment_${assignmentId}_${Date.now()}.jpg`,
                      type: 'image/jpeg',
                      size: asset.fileSize,
                    },
                    '/student/upload/file',
                    { assignmentId, type: 'assignment' },
                    onProgress
                  );
                  resolve(uploadResult);
                } else {
                  resolve({ success: false, error: 'No image selected' });
                }
              } catch (error: any) {
                resolve({ success: false, error: error.message });
              }
            },
          },
          {
            text: 'Gallery',
            onPress: async () => {
              try {
                const imageResult = await pickImage('gallery');
                if (!imageResult.canceled && imageResult.assets?.[0]) {
                  const asset = imageResult.assets[0];
                  const uploadResult = await uploadFileToServer(
                    {
                      uri: asset.uri,
                      name: `assignment_${assignmentId}_${Date.now()}.jpg`,
                      type: 'image/jpeg',
                      size: asset.fileSize,
                    },
                    '/student/upload/file',
                    { assignmentId, type: 'assignment' },
                    onProgress
                  );
                  resolve(uploadResult);
                } else {
                  resolve({ success: false, error: 'No image selected' });
                }
              } catch (error: any) {
                resolve({ success: false, error: error.message });
              }
            },
          },
          {
            text: 'Documents',
            onPress: async () => {
              try {
                const docResult = await pickDocument([...FILE_TYPES.DOCUMENTS, ...FILE_TYPES.IMAGES]);
                if (!docResult.canceled && docResult.assets?.[0]) {
                  const asset = docResult.assets[0];
                  const uploadResult = await uploadFileToServer(
                    {
                      uri: asset.uri,
                      name: asset.name,
                      type: asset.mimeType,
                      size: asset.size,
                    },
                    '/student/upload/file',
                    { assignmentId, type: 'assignment' },
                    onProgress
                  );
                  resolve(uploadResult);
                } else {
                  resolve({ success: false, error: 'No document selected' });
                }
              } catch (error: any) {
                resolve({ success: false, error: error.message });
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve({ success: false, error: 'Upload cancelled' }),
          },
        ]
      );
    });

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to upload assignment file',
    };
  }
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file icon based on file type
export const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) {
    return 'image-outline';
  } else if (fileType === 'application/pdf') {
    return 'document-text-outline';
  } else if (fileType.includes('word') || fileType.includes('document')) {
    return 'document-outline';
  } else {
    return 'attach-outline';
  }
};

export default {
  pickDocument,
  pickImage,
  uploadFileToServer,
  uploadAssignmentFile,
  validateFileSize,
  formatFileSize,
  getFileIcon,
  FILE_TYPES,
  MAX_FILE_SIZE,
};
