import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { getCorsHeaders, rejectDisallowedOrigin } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  const originError = rejectDisallowedOrigin(req);
  if (originError) return originError;

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const userSplitPdfsFolder = `${user.id}/split_pdfs`;
    
    // List all files in the user's split_pdfs folder
    const { data: files, error: listError } = await supabaseClient.storage
      .from('user_pdfs')
      .list(userSplitPdfsFolder, {
        limit: 100, // Adjust limit as needed, or implement pagination
        offset: 0,
      });

    if (listError) {
      console.error('List error:', listError);
      throw new Error(`Failed to list split PDFs: ${listError.message}`);
    }

    const filesToDelete = files
      .filter(file => file.name !== '.emptyFolderPlaceholder') // Exclude placeholder
      .map(file => `${userSplitPdfsFolder}/${file.name}`);

    if (filesToDelete.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No split PDFs found to delete.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Delete all filtered files
    const { error: deleteError } = await supabaseClient.storage
      .from('user_pdfs')
      .remove(filesToDelete);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      throw new Error(`Failed to delete all split PDFs: ${deleteError.message}`);
    }

    return new Response(JSON.stringify({ success: true, message: `Successfully deleted ${filesToDelete.length} split PDFs.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Edge Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
