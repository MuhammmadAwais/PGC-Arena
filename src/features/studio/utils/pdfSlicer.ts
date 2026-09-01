import { PDFDocument } from "pdf-lib";

/**
 * Retrieves the total number of pages in a PDF file or remote URL.
 */
export async function getPdfPageCount(
  fileOrUrl: string | File
): Promise<number> {
  let arrayBuffer: ArrayBuffer;

  if (typeof fileOrUrl === "string") {
    const res = await fetch(fileOrUrl);
    if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.statusText}`);
    arrayBuffer = await res.arrayBuffer();
  } else {
    arrayBuffer = await fileOrUrl.arrayBuffer();
  }

  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return pdfDoc.getPageCount();
}

/**
 * Slices a specific range of pages (1-indexed, inclusive) from a source PDF.
 * Returns a new lightweight PDF Blob in milliseconds on the client side.
 */
export async function slicePdfPages(
  fileOrUrl: string | File | ArrayBuffer,
  startPage: number,
  endPage: number
): Promise<{ blob: Blob; base64: string; pageCount: number }> {
  let arrayBuffer: ArrayBuffer;

  if (fileOrUrl instanceof ArrayBuffer) {
    arrayBuffer = fileOrUrl;
  } else if (typeof fileOrUrl === "string") {
    const res = await fetch(fileOrUrl);
    if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.statusText}`);
    arrayBuffer = await res.arrayBuffer();
  } else {
    arrayBuffer = await fileOrUrl.arrayBuffer();
  }

  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  const start = Math.max(1, Math.min(startPage, totalPages));
  const end = Math.min(totalPages, Math.max(start, endPage));

  const pageIndices: number[] = [];
  for (let i = start - 1; i <= end - 1; i++) {
    pageIndices.push(i);
  }

  const slicedPdf = await PDFDocument.create();
  const copiedPages = await slicedPdf.copyPages(sourcePdf, pageIndices);

  copiedPages.forEach((page) => slicedPdf.addPage(page));

  const pdfBytes = await slicedPdf.save();
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });

  // Convert Uint8Array to base64 string
  let binary = "";
  const len = pdfBytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(pdfBytes[i]);
  }
  const base64 = btoa(binary);

  return {
    blob,
    base64,
    pageCount: pageIndices.length,
  };
}
