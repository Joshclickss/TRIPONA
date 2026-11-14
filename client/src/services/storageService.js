/**
 * Supabase Storage Service for TRIPONA
 * Manages file uploads (trip photos, user avatars, travel documents),
 * retrieval of public/signed URLs, and authorized file deletion.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const storageService = {
  /**
   * Upload an image to the 'tripona-media' public bucket
   * @param {File} file - File object from input
   * @param {string} userId - Authenticated user UUID
   * @param {string} folder - 'avatars' | 'covers' | 'uploads'
   */
  async uploadImage(file, userId = 'anonymous', folder = 'uploads') {
    if (!file) throw new Error('No file provided for upload');

    // Validation
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error(`Unsupported image type (${file.type}). Allowed: JPG, PNG, WEBP, GIF.`);
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error(`File size ${(file.size / (1024 * 1024)).toFixed(1)}MB exceeds maximum allowed 5MB.`);
    }

    if (!isSupabaseConfigured) {
      // Offline fallback: Return a local DataURL preview
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          url: reader.result,
          path: `local/${folder}/${file.name}`,
          isLocal: true
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('tripona-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('tripona-media')
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      path: data.path,
      isLocal: false
    };
  },

  /**
   * Upload a user avatar and update profile
   */
  async uploadAvatar(file, userId) {
    return this.uploadImage(file, userId, 'avatars');
  },

  /**
   * Delete a media file from Supabase Storage
   */
  async deleteFile(filePath, bucket = 'tripona-media') {
    if (!filePath || !isSupabaseConfigured) return true;

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.warn('Storage file deletion warning:', error.message);
      return false;
    }
    return true;
  },

  /**
   * Get public URL for any media file
   */
  getPublicUrl(filePath, bucket = 'tripona-media') {
    if (!filePath) return '';
    if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('data:')) {
      return filePath;
    }
    if (!isSupabaseConfigured) return filePath;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data?.publicUrl || filePath;
  }
};

export default storageService;
