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

    const { pdfPaths, mergedFileName } = await req.json();

    if (!pdfPaths || !Array.isArray(pdfPaths) || pdfPaths.length < 2) {
      return new Response(JSON.stringify({ error: 'Please select at least two PDF files to merge.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const mergedPdf = await PDFDocument.create();
    const userFolder = user.id;
    const mergedFolder = `${userFolder}/merged_pdfs`; // Subfolder for merged PDFs

    for (const path of pdfPaths) {
      const { data: fileData, error: downloadError } = await supabaseClient.storage
        .from('user_pdfs')
        .download(path);

      if (downloadError) {
        console.error(`Download error for ${path}:`, downloadError);
        throw new Error(`Failed to download PDF for merging: ${downloadError.message}`);
      }

      if (!fileData) {
        throw new Error(`PDF file not found at path: ${path}`);
      }

      const pdfBytes = await fileData.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const finalMergedFileName = mergedFileName || `merged_document_${Date.now()}.pdf`;
    const mergedFilePath = `${mergedFolder}/${finalMergedFileName}`;
    const mergedPdfBytes = await mergedPdf.save();

    // Upload the merged PDF
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('user_pdfs')
      .upload(mergedFilePath, mergedPdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload merged PDF: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from('user_pdfs')
      .getPublicUrl(mergedFilePath);

    return new Response(JSON.stringify({ mergedPdfUrl: publicUrlData.publicUrl, mergedPdfPath: mergedFilePath }), {
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