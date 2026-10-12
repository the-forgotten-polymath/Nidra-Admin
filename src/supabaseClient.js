import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://notruxpxeqcbfiysvtum.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdHJ1eHB4ZXFjYmZpeXN2dHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMTY3NTYsImV4cCI6MjEwNTc5Mjc1Nn0.f6XnqidQ0koZ4ztIw1JK1dJUuPO6XvL5mWSg4OijT64';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetch all patient sleep assessment records
 */
export async function fetchAllAssessments() {
  const { data, error } = await supabase
    .from('sleep_assessments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching patient assessments:', error);
    return { data: [], error };
  }
  return { data, error: null };
}

/**
 * Update a patient sleep assessment record
 */
export async function updateAssessment(id, updates) {
  if (!id) return { data: null, error: new Error('Missing assessment ID') };
  const { data, error } = await supabase
    .from('sleep_assessments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating patient assessment:', error);
    return { data: null, error };
  }
  return { data, error: null };
}
