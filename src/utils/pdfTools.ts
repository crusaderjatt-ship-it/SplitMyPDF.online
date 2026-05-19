import { PDFDocument } from "pdf-lib";

export const ANONYMOUS_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const ANONYMOUS_MAX_FILES = 5;

export interface ProcessedPdf {
  fileName: string;
  bytes: Uint8Array;
  pageCount?: number;
  note?: string;
}

export interface SplitPdfOptions {
  pagesPerSplit: number;
}

export interface ExtractPdfOptions {
  ranges: string;
}

const sanitizeFileName = (name: string) =>
  name
    .replace(/\.pdf$/i, "")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "document";

const assertPdf = (file: File) => {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error(`${file.name} is not a PDF file.`);
  }

  if (file.size > ANONYMOUS_MAX_FILE_SIZE_BYTES) {
    throw new Error("Anonymous tools support files up to 10MB. Create an account or upgrade for larger documents.");
  }
};

export const createDownloadUrl = (bytes: Uint8Array) => {
  const blob = new Blob([bytes], { type: "application/pdf" });
  return URL.createObjectURL(blob);
};

export const getPdfPageCount = async (file: File) => {
  assertPdf(file);
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  return pdf.getPageCount();
};

export const splitPdfInBrowser = async (
  file: File,
  options: SplitPdfOptions,
): Promise<ProcessedPdf[]> => {
  assertPdf(file);

  const pagesPerSplit = Math.max(1, Math.floor(options.pagesPerSplit || 1));
  const sourcePdf = await PDFDocument.load(await file.arrayBuffer());
  const pageCount = sourcePdf.getPageCount();
  const baseName = sanitizeFileName(file.name);
  const results: ProcessedPdf[] = [];

  for (let start = 0; start < pageCount; start += pagesPerSplit) {
    const end = Math.min(start + pagesPerSplit, pageCount);
    const outputPdf = await PDFDocument.create();
    const pageIndexes = Array.from({ length: end - start }, (_, index) => start + index);
    const copiedPages = await outputPdf.copyPages(sourcePdf, pageIndexes);
    copiedPages.forEach((page) => outputPdf.addPage(page));
    const bytes = await outputPdf.save({ useObjectStreams: true });
    const partNumber = Math.floor(start / pagesPerSplit) + 1;

    results.push({
      fileName: `${baseName}_page_${partNumber}.pdf`,
      bytes,
      pageCount: copiedPages.length,
    });
  }

  return results;
};

export const mergePdfsInBrowser = async (
  files: File[],
  mergedFileName = "merged-document.pdf",
): Promise<ProcessedPdf> => {
  if (files.length < 2) {
    throw new Error("Select at least two PDFs to merge.");
  }

  if (files.length > ANONYMOUS_MAX_FILES) {
    throw new Error("Anonymous merge supports up to 5 files. Upgrade for larger batches.");
  }

  const outputPdf = await PDFDocument.create();
  let pageCount = 0;

  for (const file of files) {
    assertPdf(file);
    const sourcePdf = await PDFDocument.load(await file.arrayBuffer());
    const copiedPages = await outputPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
    copiedPages.forEach((page) => outputPdf.addPage(page));
    pageCount += copiedPages.length;
  }

  return {
    fileName: mergedFileName.toLowerCase().endsWith(".pdf") ? mergedFileName : `${mergedFileName}.pdf`,
    bytes: await outputPdf.save({ useObjectStreams: true }),
    pageCount,
  };
};

const parsePageRanges = (ranges: string, totalPages: number) => {
  const indexes = new Set<number>();

  ranges
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const [startText, endText] = part.split("-").map((value) => value.trim());
      const start = Number(startText);
      const end = endText ? Number(endText) : start;

      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end > totalPages) {
        throw new Error(`Invalid page range "${part}". Use values like 1,3-5.`);
      }

      for (let page = start; page <= end; page += 1) {
        indexes.add(page - 1);
      }
    });

  if (indexes.size === 0) {
    throw new Error("Enter at least one page or range to extract.");
  }

  return Array.from(indexes).sort((a, b) => a - b);
};

export const extractPagesInBrowser = async (
  file: File,
  options: ExtractPdfOptions,
): Promise<ProcessedPdf> => {
  assertPdf(file);

  const sourcePdf = await PDFDocument.load(await file.arrayBuffer());
  const pageIndexes = parsePageRanges(options.ranges, sourcePdf.getPageCount());
  const outputPdf = await PDFDocument.create();
  const copiedPages = await outputPdf.copyPages(sourcePdf, pageIndexes);
  copiedPages.forEach((page) => outputPdf.addPage(page));

  return {
    fileName: `${sanitizeFileName(file.name)}_extracted.pdf`,
    bytes: await outputPdf.save({ useObjectStreams: true }),
    pageCount: copiedPages.length,
  };
};

export const compressPdfInBrowser = async (
  file: File,
  targetSizeKb?: number,
): Promise<ProcessedPdf> => {
  assertPdf(file);

  const sourcePdf = await PDFDocument.load(await file.arrayBuffer());
  const outputPdf = await PDFDocument.create();
  const copiedPages = await outputPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
  copiedPages.forEach((page) => outputPdf.addPage(page));
  const bytes = await outputPdf.save({ useObjectStreams: true, addDefaultPage: false });
  const targetText = targetSizeKb ? ` Target: ${targetSizeKb}KB.` : "";

  return {
    fileName: `${sanitizeFileName(file.name)}_compressed.pdf`,
    bytes,
    pageCount: copiedPages.length,
    note: `Best-effort browser compression complete. Exact target size is not guaranteed for image-heavy scanned PDFs.${targetText}`,
  };
};
