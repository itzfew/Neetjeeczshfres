import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { get, ref } from 'firebase/database';
import { realtimeDb } from '../firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('../components/PDFViewer'), { ssr: false });

export default function ViewPDF() {
  const router = useRouter();
  const { pdfId } = router.query;
  const [pdfUrl, setPdfUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPdfUrl = async () => {
      if (pdfId) {
        const filesRef = ref(realtimeDb, 'files');
        const snapshot = await get(filesRef);
        if (snapshot.exists()) {
          const files = snapshot.val();
          const pdf = Object.values(files).find(file => file.pdfId === pdfId);
          if (pdf) {
            setPdfUrl(pdf.url);
          }
        }
        setIsLoading(false);
      }
    };
    fetchPdfUrl();
  }, [pdfId]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : pdfUrl ? (
            <PDFViewer pdfUrl={pdfUrl} />
          ) : (
            <p className="text-center text-gray-600">PDF not found.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
