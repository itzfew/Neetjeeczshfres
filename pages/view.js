import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PDFViewer from '../components/PDFViewer';

export default function ViewPDF() {
  const router = useRouter();
  const { pdfId } = router.query;
  const [pdfUrl, setPdfUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user && pdfId) {
        const db = getDatabase();
        const filesRef = ref(db, 'files');
        onValue(filesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const file = Object.values(data).find((f) => f.pdfId === pdfId);
            if (file) {
              setPdfUrl(file.url);
              const purchasesRef = ref(db, `purchases/${user.uid}/${file.folder}`);
              onValue(purchasesRef, (snapshot) => {
                setIsPurchased(!!snapshot.val());
                setIsLoading(false);
              });
            } else {
              setIsLoading(false);
              toast.error('PDF not found.');
            }
          } else {
            setIsLoading(false);
            toast.error('PDF not found.');
          }
        });
      } else {
        setIsLoading(false);
        toast.error('Please sign in to view this PDF.');
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [pdfId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isPurchased) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar user={user} />
        <ToastContainer />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <p className="text-center text-gray-600">
              You have not purchased this course. Please purchase it to access the materials.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      <ToastContainer />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <PDFViewer pdfUrl={pdfUrl} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
