import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { get, ref } from 'firebase/database';
import { realtimeDb, db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { toast } from 'react-toastify';

export async function getServerSideProps() {
  return { props: {} }; // Prevent static generation
}

export default function CoursePage() {
  const router = useRouter();
  const { courseName } = router.query;
  const { user, loading } = useAuth();
  const [pdfs, setPdfs] = useState([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPurchaseAndFetchPdfs = async () => {
      if (loading || !user || !courseName) return;

      const purchaseRef = doc(db, 'purchases', `${user.uid}_${courseName}`);
      const purchaseSnap = await getDoc(purchaseRef);
      setHasPurchased(purchaseSnap.exists());

      if (purchaseSnap.exists()) {
        const filesRef = ref(realtimeDb, 'files');
        const snapshot = await get(filesRef);
        if (snapshot.exists()) {
          const files = snapshot.val();
          const coursePdfs = Object.values(files)
            .filter((file) => file.folder === courseName)
            .map((file) => ({
              name: file.name,
              url: file.url,
              pdfId: file.pdfId,
            }));
          setPdfs(coursePdfs);
        }
      } else {
        toast.error('Please purchase this course to access the materials');
        router.push('/');
      }
      setIsLoading(false);
    };
    checkPurchaseAndFetchPdfs();
  }, [user, loading, courseName, router]);

  const viewPdf = (pdfId) => {
    router.push(`/view?pdfId=${pdfId}`);
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          {hasPurchased ? (
            <>
              <h1 className="text-3xl font-bold text-center mb-12">{courseName} Materials</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {pdfs.map((pdf) => (
                  <div
                    key={pdf.pdfId}
                    className="p-4 bg-white rounded-lg shadow-md cursor-pointer hover:bg-gray-100"
                    onClick={() => viewPdf(pdf.pdfId)}
                  >
                    <h3 className="text-lg font-semibold">{pdf.name}</h3>
                    <p className="text-indigo-600">View PDF</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-600">Checking purchase status...</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
