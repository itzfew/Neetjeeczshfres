import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth, database } from '../firebase';
import { get, ref } from 'firebase/database';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';

export default function ViewPDF() {
  const router = useRouter();
  const { pdfId } = router.query;
  const [pdfUrl, setPdfUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      toast.error('Please sign in to view the PDF');
      router.push('/login');
      return;
    }

    const fetchPDF = async () => {
      const filesRef = ref(database, 'files');
      const userRef = ref(database, `users/${auth.currentUser.uid}/purchases`);
      const [fileSnapshot, userSnapshot] = await Promise.all([get(filesRef), get(userRef)]);

      if (fileSnapshot.exists()) {
        const files = fileSnapshot.val();
        const file = Object.values(files).find((f) => f.pdfId === pdfId);
        if (file) {
          setPdfUrl(file.url);
          setIsPurchased(userSnapshot.exists() && userSnapshot.val()[file.folder]);
        }
      }
      setIsLoading(false);
    };

    if (pdfId) {
      fetchPDF();
    }
  }, [pdfId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!pdfUrl || !isPurchased) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <p className="text-center text-gray-600">
              {pdfUrl ? 'Please purchase the course to access this PDF.' : 'PDF not found.'}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <iframe src={pdfUrl} className="w-full h-[80vh]" title="PDF Viewer"></iframe>
        </div>
      </main>
      <Footer />
    </div>
  );
}
