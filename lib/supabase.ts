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