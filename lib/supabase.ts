
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xqjfclezwhnhtgjttdbf.supabase.co';
const supabaseKey = 'sb_publishable_VXk1CEucY0LzogrhjcS90Q_svlT7VfK';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper for Key-Value settings
export const getSetting = async (key: string) => {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();
  
  if (error) return null;
  return data.value;
};

export const saveSetting = async (key: string, value: any) => {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date() }, { onConflict: 'key' });
  
  if (error) console.error(`Error saving setting ${key}:`, error);
};

/**
 * Uploads a file to Supabase Storage
 * @param file The file object from input
 * @param bucket The storage bucket name (defaults to 'resources')
 */
export const uploadFile = async (file: File, bucket: string = 'resources') => {
  try {
    if (!file) throw new Error("No file selected.");

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      // Catch RLS errors specifically
      if (error.message.toLowerCase().includes('row-level security') || error.message.toLowerCase().includes('rls')) {
        throw new Error("RLS_ERROR: Upload blocked by Supabase Row-Level Security. You must create a Storage Policy in the Supabase Dashboard.");
      }
      
      if (error.message.toLowerCase().includes('bucket not found') || (error as any).status === 404) {
        throw new Error(`BUCKET_NOT_FOUND: Bucket "${bucket}" does not exist.`);
      }
      
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err: any) {
    console.error('Supabase Storage Error:', err);
    throw err;
  }
};
