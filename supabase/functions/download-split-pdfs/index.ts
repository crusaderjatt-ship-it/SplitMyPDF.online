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
    console.log('Edge Function: download-split-pdfs invoked.');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: userError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    if (!user) {
      console.log('Unauthorized: No user session found.');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    console.log('User authenticated:', user.id);

    const splitFolderPath = `${user.id}/split_pdfs`;
    console.log('Listing files in path:', splitFolderPath);
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
    console.log(`Found ${files.length} files to potentially zip.`);

    const zipWriter = new ZipWriter();
    let filesAddedToZip = 0;

    for (const file of files) {
      if (file.name === '.emptyFolderPlaceholder') {
        console.log(`Skipping placeholder file: ${file.name}`);
        continue;
      }

      const filePath = `${splitFolderPath}/${file.name}`;
      console.log(`Attempting to download file: ${filePath}`);
      const { data: fileData, error: downloadError } = await supabaseClient.storage
        .from('user_pdfs')
        .download(filePath);

      if (downloadError) {
        console.warn(`Failed to download ${file.name}: ${downloadError.message}`);
        continue; // Skip this file but continue with others
      }

      if (fileData) {
        console.log(`Adding ${file.name} to zip.`);
        await zipWriter.add(file.name, fileData.stream());
        filesAddedToZip++;
      }
    }
    console.log(`Successfully added ${filesAddedToZip} files to zip.`);

    const zippedBlob = await zipWriter.close();
    const zippedBytes = await zippedBlob.arrayBuffer();
    console.log(`Zip file created with size: ${zippedBytes.byteLength} bytes.`);

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