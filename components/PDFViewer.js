import { useEffect, useRef } from 'react';

export default function PDFViewer({ pdfUrl }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadPDF = async () => {
      const pdfjsLib = window.pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const page = await pdf.getPage(1);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
      } catch (error) {
        console.error('Error rendering PDF:', error);
      }
    };
    loadPDF();
  }, [pdfUrl]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}
