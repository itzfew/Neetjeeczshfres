import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast, ToastContainer } from 'react-toastify';
import PDFViewer from '../components/PDFViewer';
import { FaFilePdf, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/router';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export default function View() {
  const [user, setUser] = useState(null);
  const [pdfId, setPdfId] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { pdfid, orderId } = router.query;
    setPdfId(pdfid);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        toast.error('Please log in to view this content.');
        router.push('/');
        return;
      }

      if (orderId) {
        const response = await fetch(`/api/verify-payment?orderId=${orderId}&userId=${currentUser.uid}`);
        const result = await response.json();
        if (result.success) {
          toast.success('Payment verified! Access granted.');
        } else {
          toast.error('Payment verification failed.');
        }
      }

      if (pdfid) {
        const fileRef = ref(database, 'files');
        const snapshot = await get(fileRef);
        let folder = null;
        snapshot.forEach((childSnapshot) => {
          const fileData = childSnapshot.val();
          if (fileData.pdfId === pdfid) {
            folder = fileData.folder;
          }
        });

        if (folder) {
          const purchaseRef = ref(database, `purchases/${currentUser.uid}/${folder}`);
          const purchaseSnapshot = await get(purchaseRef);
          setIsPurchased(purchaseSnapshot.exists());
        }
      }
    });

    return () => unsubscribe();
  }, [router.query]);

  if (!user || !pdfId) return null;

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <header className="bg-white shadow p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <FaFilePdf className="mr-2 text-red-500" /> PDF Viewer
          </h1>
          <div className="flex items-center space-x-4">
            <a
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Back to Files
            </a>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">
        {isPurchased ? (
          <PDFViewer pdfId={pdfId} />
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Access Restricted</h2>
            <p className="text-gray-600 mb-4">Please purchase the course to view this PDF.</p>
            <a
              href="/"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center"
            >
              Go to Courses
            </a>
          </div>
        )}
      </main>
      <ToastContainer />
    </div>
  );
}
