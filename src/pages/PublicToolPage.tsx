import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, FileArchive, FileInput, Files, Loader2, Lock, Scissors, Sparkles, UploadCloud } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AdSenseSlot from "@/components/AdSenseSlot";
import RazorpayCheckoutButton from "@/components/RazorpayCheckoutButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ANONYMOUS_MAX_FILE_SIZE_BYTES,
  createDownloadUrl,
  extractPagesInBrowser,
  mergePdfsInBrowser,
  ProcessedPdf,
  splitPdfInBrowser,
  compressPdfInBrowser,
} from "@/utils/pdfTools";
import { logUsageEvent } from "@/utils/usage";
import { showError, showSuccess } from "@/utils/toast";

type ToolKind = "split-pdf" | "merge-pdf" | "extract-pages" | "compress-pdf";

const toolCopy: Record<ToolKind, {
  title: string;
  description: string;
  icon: typeof Scissors;
  action: string;
  acceptMultiple: boolean;
}> = {
  "split-pdf": {
    title: "Split PDF Online",
    description: "Split application forms, certificates, scanned PDFs, and school documents directly in your browser.",
    icon: Scissors,
    action: "Split PDF",
    acceptMultiple: false,
  },
  "merge-pdf": {
    title: "Merge PDF Online",
    description: "Combine certificates, ID documents, mark sheets, and form attachments into one upload-ready PDF.",
    icon: Files,
    action: "Merge PDFs",
    acceptMultiple: true,
  },
  "extract-pages": {
    title: "Extract Pages From PDF",
    description: "Pull only the pages you need from a large PDF before uploading it to a portal or sharing it.",
    icon: FileInput,
    action: "Extract Pages",
    acceptMultiple: false,
  },
  "compress-pdf": {
    title: "Compress PDF Online",
    description: "Create a smaller PDF copy for online forms. Best-effort browser compression, with clear size messaging.",
    icon: FileArchive,
    action: "Compress PDF",
    acceptMultiple: false,
  },
};

interface ResultWithUrl extends ProcessedPdf {
  url: string;
}

const defaultTool: ToolKind = "split-pdf";
const maxMb = Math.round(ANONYMOUS_MAX_FILE_SIZE_BYTES / 1024 / 1024);

const PublicToolPage = () => {
  const { toolSlug } = useParams();
  const tool = (toolSlug && toolSlug in toolCopy ? toolSlug : defaultTool) as ToolKind;
  const copy = toolCopy[tool];
  const Icon = copy.icon;
  const [files, setFiles] = useState<File[]>([]);
  const [pagesPerSplit, setPagesPerSplit] = useState(1);
  const [ranges, setRanges] = useState("1");
  const [targetSizeKb, setTargetSizeKb] = useState(200);
  const [mergedName, setMergedName] = useState("merged-document.pdf");
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ResultWithUrl[]>([]);

  useEffect(() => {
    document.title = `${copy.title} - Free Browser Tool | SplitMyPDF.online`;
    return () => {
      results.forEach((result) => URL.revokeObjectURL(result.url));
    };
  }, [copy.title, results]);

  const fileHelp = useMemo(() => {
    if (tool === "merge-pdf") return `Choose 2-5 PDF files, up to ${maxMb}MB each.`;
    return `Choose one PDF up to ${maxMb}MB.`;
  }, [tool]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    setFiles(selected);
    setResults((current) => {
      current.forEach((result) => URL.revokeObjectURL(result.url));
      return [];
    });
  };

  const processFiles = async () => {
    setProcessing(true);
    setResults((current) => {
      current.forEach((result) => URL.revokeObjectURL(result.url));
      return [];
    });

    try {
      let processed: ProcessedPdf[] = [];

      if (tool === "split-pdf") {
        if (!files[0]) throw new Error("Choose a PDF to split.");
        processed = await splitPdfInBrowser(files[0], { pagesPerSplit });
      }

      if (tool === "merge-pdf") {
        processed = [await mergePdfsInBrowser(files, mergedName)];
      }

      if (tool === "extract-pages") {
        if (!files[0]) throw new Error("Choose a PDF to extract pages from.");
        processed = [await extractPagesInBrowser(files[0], { ranges })];
      }

      if (tool === "compress-pdf") {
        if (!files[0]) throw new Error("Choose a PDF to compress.");
        processed = [await compressPdfInBrowser(files[0], targetSizeKb)];
      }

      const nextResults = processed.map((result) => ({
        ...result,
        url: createDownloadUrl(result.bytes),
      }));

      setResults(nextResults);
      await logUsageEvent(tool, {
        fileCount: files.length,
        totalBytes: files.reduce((sum, file) => sum + file.size, 0),
        resultCount: nextResults.length,
      });
      showSuccess("Your PDF is ready. No upload was required for this free tool.");
    } catch (error: any) {
      showError(error.message || "PDF processing failed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-28">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Icon className="h-6 w-6" />
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-slate-950 dark:text-white md:text-5xl">
                {copy.title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-300">
                {copy.description} Free basic jobs run locally in your browser, so your document does not leave your device.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {["No signup for basics", "Browser-first privacy", "Made for Indian forms"].map((item) => (
                <div key={item} className="rounded-md border bg-white p-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <UploadCloud className="h-5 w-5 text-blue-600" />
                Start free
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="pdf-files">{fileHelp}</Label>
                <Input
                  id="pdf-files"
                  type="file"
                  accept="application/pdf"
                  multiple={copy.acceptMultiple}
                  onChange={handleFileChange}
                />
              </div>

              {tool === "split-pdf" && (
                <div className="space-y-2">
                  <Label htmlFor="pages-per-split">Pages per output PDF</Label>
                  <Input
                    id="pages-per-split"
                    type="number"
                    min={1}
                    value={pagesPerSplit}
                    onChange={(event) => setPagesPerSplit(Number(event.target.value))}
                  />
                </div>
              )}

              {tool === "merge-pdf" && (
                <div className="space-y-2">
                  <Label htmlFor="merged-name">Output file name</Label>
                  <Input
                    id="merged-name"
                    value={mergedName}
                    onChange={(event) => setMergedName(event.target.value)}
                  />
                </div>
              )}

              {tool === "extract-pages" && (
                <div className="space-y-2">
                  <Label htmlFor="page-ranges">Pages to extract</Label>
                  <Textarea
                    id="page-ranges"
                    value={ranges}
                    onChange={(event) => setRanges(event.target.value)}
                    placeholder="Example: 1,3-5,8"
                    className="min-h-20"
                  />
                </div>
              )}

              {tool === "compress-pdf" && (
                <div className="space-y-2">
                  <Label htmlFor="target-size">Target size in KB</Label>
                  <Input
                    id="target-size"
                    type="number"
                    min={50}
                    value={targetSizeKb}
                    onChange={(event) => setTargetSizeKb(Number(event.target.value))}
                  />
                </div>
              )}

              <Button onClick={processFiles} disabled={processing || files.length === 0} className="w-full">
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {copy.action}
              </Button>

              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
                <Lock className="h-4 w-4" />
                <AlertTitle>Privacy-first free tool</AlertTitle>
                <AlertDescription>
                  Basic jobs are processed in your browser. Upgrade only when you need larger files, saved history, or batch workflows.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </section>

        {results.length > 0 && (
          <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Your files are ready</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.map((result) => (
                  <div key={result.fileName} className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                    <div>
                      <p className="font-medium">{result.fileName}</p>
                      <p className="text-sm text-slate-500">
                        {result.pageCount ? `${result.pageCount} page${result.pageCount === 1 ? "" : "s"}` : "PDF"}
                        {result.note ? ` - ${result.note}` : ""}
                      </p>
                    </div>
                    <Button asChild variant="outline">
                      <a href={result.url} download={result.fileName}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <AdSenseSlot slot={import.meta.env.VITE_ADSENSE_RESULT_SLOT} />
              <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    Need bigger jobs?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-blue-950 dark:text-blue-100">
                  <p>Pro unlocks larger files, batch processing, no ads, saved history, and priority cloud processing.</p>
                  <RazorpayCheckoutButton planId="pro-monthly" label="Upgrade to Pro" className="w-full" />
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          {Object.entries(toolCopy).map(([slug, item]) => (
            <Link key={slug} to={`/tools/${slug}`} className="rounded-md border bg-white p-4 transition hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-semibold">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
};

export default PublicToolPage;
