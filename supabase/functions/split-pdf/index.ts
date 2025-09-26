import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { PDFDocument } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Parse the request body to get the PDF path
    const { pdfPath } = await req.json();

    if (!pdfPath) {
      return new Response(JSON.stringify({ error: 'Missing pdfPath in request body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Download the original PDF from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('user_pdfs')
      .download(pdfPath);

    if (downloadError) {
      console.error('Download error:', downloadError);
      return new Response(JSON.stringify({ error: `Failed to download PDF: ${downloadError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!fileData) {
      return new Response(JSON.stringify({ error: 'PDF file not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Load the PDF document
    const pdfBytes = await fileData.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const numberOfPages = pdfDoc.getPages().length;
    const splitPdfUrls: string[] = [];

    // Extract original file name for naming split pages
    const originalFileName = pdfPath.split('/').pop()?.split('.').slice(0, -1).join('.') || 'document';
    const userFolder = user.id;
    const splitFolder = `${userFolder}/split_pdfs`; // Subfolder for split PDFs

    // Split each page and upload
    for (let i = 0; i < numberOfPages; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);

      const splitPdfBytes = await newPdf.save();
      const splitFileName = `${originalFileName}_page_${i + 1}.pdf`;
      const splitFilePath = `${splitFolder}/${splitFileName}`;

      // Upload the split PDF page
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('user_pdfs')
        .upload(splitFilePath, splitPdfBytes, {
          contentType: 'application/pdf',
          upsert: true, // Allow overwriting if a file with the same name exists
        });

      if (uploadError) {
        console.error(`Upload error for page ${i + 1}:`, uploadError);
        throw new Error(`Failed to upload split PDF page ${i + 1}: ${uploadError.message}`);
      }

      // Get the public URL for the uploaded split page
      const { data: publicUrlData } = supabaseClient.storage
        .from('user_pdfs')
        .getPublicUrl(splitFilePath);
      
      splitPdfUrls.push(publicUrlData.publicUrl);
    }

    return new Response(JSON.stringify({ splitPdfUrls }), {
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