import { useEffect, useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { toast } from 'react-toastify';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

export default function PDFViewer({ pdfId }) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const database = getDatabase();
    const fileRef = ref(database, 'files');

    get(fileRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const fileData = childSnapshot.val();
            if (fileData.pdfId === pdfId) {
              setPdfUrl(fileData.url);
            }
          });
        } else {
          toast.error('PDF not found');
          setLoading(false);
        }
      })
      .catch((error) => {
        toast.error(`Error: ${error.message}`);
        setLoading(false);
      });
  }, [pdfId]);

  useEffect(() => {
    if (pdfUrl) {
      pdfjsLib.getDocument(pdfUrl).promise.then((pdf) => {
        setPdfDoc(pdf);
        setLoading(false);
        renderPages(pdf);
      }).catch((error) => {
        toast.error('Failed to load PDF');
        setLoading(false);
      });
    }
  }, [pdfUrl]);

  const renderPages = (pdf) => {
    const pdfViewer = document.getElementById('pdfViewer');
    pdfViewer.innerHTML = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const pageContainer = document.createElement('div');
      pageContainer.className = 'page-container';
      const canvas = document.createElement('canvas');
      canvas.className = 'page-canvas';
      pageContainer.appendChild(canvas);
      pdfViewer.appendChild(pageContainer);

      pdf.getPage(pageNum).then((page) => {
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        page.render({ canvasContext: canvas.getContext('2d'), viewport });
      });
    }
  };

  return (
    <>
      <div id="loading" className={loading ? 'flex justify-center items-center h-64' : 'hidden'}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
      <div
        id="pdfViewer"
        className={`bg-white rounded-lg shadow-lg p-4 ${loading ? 'hidden' : ''}`}
        style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', scrollSnapType: 'y mandatory' }}
      ></div>
    </>
  );
}
