import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - The storage path (e.g., 'users/user123/profile.jpg')
 * @param {function} onProgress - Optional callback for progress updates
 * @returns {Promise<{success: boolean, url: string, path: string, error: string}>}
 */
export const uploadFile = async (file, path, onProgress) => {
  try {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          // Handle errors
          console.error('Upload error:', error);
          resolve({ success: false, error: error.message });
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            success: true,
            url: downloadURL,
            path: path
          });
        }
      );
    });
  } catch (error) {
    console.error('Error preparing upload:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get the download URL for a file in Firebase Storage
 * @param {string} path - The storage path
 * @returns {Promise<{success: boolean, url: string, error: string}>}
 */
export const getFileURL = async (path) => {
  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return { success: true, url };
  } catch (error) {
    console.error('Error getting download URL:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a file from Firebase Storage
 * @param {string} path - The storage path to delete
 * @returns {Promise<{success: boolean, error: string}>}
 */
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: error.message };
  }
}; 