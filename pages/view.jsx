import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import * as pdfjsLib from 'pdfjs-dist';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaFilePdf, FaDownload, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

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

export default function PDFViewer() {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDownload, setShowDownload] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const { pdfid } = router.query;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else if (pdfid) {
        loadPDF(pdfid);
      }
    });
    return () => unsubscribe();
  }, [pdfid, router]);

  const loadPDF = (pdfId) => {
    setLoading(true);
    const filesRef = query(ref(database, 'courses'), orderByChild('pdfId'), equalTo(pdfId));
    onValue(filesRef, (snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const fileData = childSnapshot.val();
          const fileUrl = fileData.url;
          setPdfUrl(fileUrl);

          pdfjsLib.getDocument(fileUrl).promise.then((pdf) => {
            setPdfDoc(pdf);
            setShowDownload(false);
            setLoading(false);
            renderPages(pdf);
          }).catch((error) => {
            console.error('Error loading PDF:', error);
            toast.error('Failed to load PDF');
            setShowDownload(true);
            setLoading(false);
          });
        });
      } else {
        toast.error('PDF not found');
        setLoading(false);
      }
    }, (error) => {
      toast.error(`Error: ${error.message}`);
      setLoading(false);
    });
  };

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
        page.render({
          canvasContext: canvas.getContext('2d'),
          viewport,
        });
      }).catch((error) => {
        console.error(`Error rendering page ${pageNum}:`, error);
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageContainer = entry.target;
            const pageNum = Array.from(pdfViewer.children).indexOf(pageContainer) + 1;
            setCurrentPage(pageNum);
          }
        });
      },
      { threshold: 0.5 }
    );

    Array.from(pdfViewer.children).forEach((child) => observer.observe(child));
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <ToastContainer />
      <header className="bg-white shadow p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <FaFilePdf className="mr-2 text-red-500" /> PDF Viewer
          </h1>
          <div className="flex items-center space-x-4">
            {pdfUrl && (
              <a
                href={pdfUrl}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <FaDownload className="mr-2" /> Download
              </a>
            )}
            <Link href="/">
              <a className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <FaArrowLeft className="mr-2" /> Back to Courses
              </a>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">
        {loading && (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin h-12 w-12 text-blue-600" />
          </div>
        )}
        <div
          id="pdfViewer"
          className="bg-white rounded-lg shadow-lg p-4"
          style={{
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            scrollSnapType: 'y mandatory',
            scrollbarWidth: 'none',
          }}
        ></div>
        {showDownload && (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Unable to Load PDF</h2>
            <p className="text-gray-600 mb-4">The PDF could not be loaded. You can download it instead.</p>
            <a
              href={pdfUrl}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 inline-flex items-center"
            >
              <FaDownload className="mr-2" /> Download PDF
            </a>
          </div>
        )}
        {pdfDoc && (
          <div className="fixed bottom-4 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-medium">
            {currentPage} / {pdfDoc.numPages}
          </div>
        )}
      </main>
    </div>
  );
}
