import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('../components/PDFViewer'), { ssr: false });

export default function ViewPDF() {
  const router = useRouter();
  const { pdfId } = router.query;
  const { user } = useAuth();
  const [pdfUrl, setPdfUrl] = useState('');
  const [isPurchased, setIsPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (pdfId && user) {
        const db = getDatabase();
        const filesRef = ref(db, 'files');
        try {
          const snapshot = await get(filesRef);
          if (snapshot.exists()) {
            const files = snapshot.val();
            const pdf = Object.values(files).find((file) => file.pdfId === pdfId);
            if (pdf) {
              const purchaseRef = ref(db, `purchases/${user.uid}/courses/${pdf.folder}`);
              const purchaseSnapshot = await get(purchaseRef);
              if (purchaseSnapshot.exists()) {
                setPdfUrl(pdf.url);
                setIsPurchased(true);
              } else {
                toast.error('You need to purchase this course to view the PDF.');
                router.push(`/courses/${pdf.folder}`);
              }
            } else {
              toast.error('PDF not found.');
            }
          }
          setIsLoading(false);
        } catch (error) {
          console.error('Error checking PDF access:', error);
          toast.error('Failed to load PDF.');
          setIsLoading(false);
        }
      } else {
        toast.error('Please sign in to view this PDF.');
        setIsLoading(false);
      }
    };
    checkAccess();
  }, [pdfId, user, router]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : isPurchased && pdfUrl ? (
            <PDFViewer pdfUrl={pdfUrl} />
          ) : (
            <p className="text-center text-gray-600">Access denied or PDF not found.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
