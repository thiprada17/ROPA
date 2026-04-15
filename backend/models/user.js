import { supabase } from '../config/supabaseClient.js';

export async function findUserByIdentifier(identifier) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .or(`email.eq.${identifier},username.eq.${identifier}`)
    .single();

  if (error) return null;
  return data;
}

export async function incrementFailedAttempts(userId, currentAttempts) {
  const newAttempts = currentAttempts + 1;
  const shouldLock = newAttempts >= 5;

  await supabase
    .from('users')
    .update({
      failed_login_attempts: newAttempts,
      is_lock: shouldLock,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return { newAttempts, shouldLock };
}

export async function resetFailedAttempts(userId) {
  await supabase
    .from('users')
    .update({
      failed_login_attempts: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
}