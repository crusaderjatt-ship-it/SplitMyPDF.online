import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { ZipWriter } from "https://deno.land/x/zip@v1.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

    const splitFolderPath = `${user.id}/split_pdfs`;
    const { data: files, error: listError } = await supabaseClient.storage
      .from('user_pdfs')
      .list(splitFolderPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (listError) {
      console.error('List error:', listError);
      return new Response(JSON.stringify({ error: `Failed to list split PDFs: ${listError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const zipWriter = new ZipWriter();

    for (const file of files) {
      if (file.name === '.emptyFolderPlaceholder') continue;

      const filePath = `${splitFolderPath}/${file.name}`;
      const { data: fileData, error: downloadError } = await supabaseClient.storage
        .from('user_pdfs')
        .download(filePath);

      if (downloadError) {
        console.warn(`Failed to download ${file.name}: ${downloadError.message}`);
        continue; // Skip this file but continue with others
      }

      if (fileData) {
        await zipWriter.add(file.name, fileData.stream());
      }
    }

    const zippedBlob = await zipWriter.close();
    const zippedBytes = await zippedBlob.arrayBuffer();

    return new Response(zippedBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="split_pdfs.zip"',
      },
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