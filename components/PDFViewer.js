import { useEffect, useRef } from 'react';

export default function PDFViewer({ pdfUrl }) {
  const viewerRef = useRef(null);

  useEffect(() => {
    const loadPDFViewer = async () => {
      const pdfjsLib = await import('pdfjs-dist/build/pdf');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';

      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const viewer = viewerRef.current;
      const context = viewer.getContext('2d');
      const viewport = page.getViewport({ scale: 1.5 });

      viewer.height = viewport.height;
      viewer.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;
    };
    loadPDFViewer();
  }, [pdfUrl]);

  return <canvas ref={viewerRef} className="mx-auto border" />;
}
