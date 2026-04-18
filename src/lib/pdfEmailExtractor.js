import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function extractTextFromPdf(file) {
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  const pages = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    let text = '';
    let lastY = -1;
    for (const item of content.items) {
      if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
        text += '\n'; // new line if Y coordinate changes significantly
      } else if (lastY !== -1) {
        text += ' '; // space if on the same line
      }
      text += item.str;
      lastY = item.transform[5];
    }
    pages.push(text);
  }

  return pages.join('\n');
}
