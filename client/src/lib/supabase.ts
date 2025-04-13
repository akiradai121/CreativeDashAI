import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

// Storage buckets
export const STORAGE_BUCKETS = {
  BOOKS: 'books',
  IMAGES: 'images',
  PDF: 'pdf',
  EPUB: 'epub',
  DOCX: 'docx',
};

// Helper to upload file to storage
export async function uploadFile(bucket: string, path: string, file: File | Blob) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
    });

  if (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }

  return data;
}

// Helper to get public URL for a file
export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// Helper to delete a file
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  
  if (error) {
    throw new Error(`Error deleting file: ${error.message}`);
  }

  return true;
}

// Helper to list files in a directory
export async function listFiles(bucket: string, prefix: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(prefix);

  if (error) {
    throw new Error(`Error listing files: ${error.message}`);
  }

  return data;
}
