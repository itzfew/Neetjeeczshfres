import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';

export default function PDFViewer({ pdfUrl }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadPDF = async () => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;
    };

    loadPDF();
  }, [pdfUrl]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}
