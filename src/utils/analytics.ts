import { supabase } from '@/integrations/supabase/client';

interface UserActionDetails {
  fileName?: string;
  pagesProcessed?: number;
  originalFileName?: string;
  mergedFileName?: string;
  [key: string]: any; // Allow for other arbitrary details
}

export const logUserAction = async (
  userId: string,
  actionType: string,
  details?: UserActionDetails
) => {
  try {
    const { error } = await supabase
      .from('user_actions')
      .insert({
        user_id: userId,
        action_type: actionType,
        details: details || {},
      });

    if (error) {
      console.error('Error logging user action:', error.message);
    }
  } catch (error: any) {
    console.error('Caught error logging user action:', error.message);
  }
};