import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaFolder, FaFilePdf, FaArrowLeft, FaSpinner } from 'react-icons/fa';

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

export default function Course() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { courseId } = router.query;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login?mode=login');
      } else if (courseId) {
        fetchCourse(courseId);
      }
    });
    return () => unsubscribe();
  }, [courseId, router]);

  const fetchCourse = (id) => {
    setLoading(true);
    const courseRef = ref(database, `courses/${id}`);
    onValue(courseRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCourse(data);
      } else {
        toast.error('Course not found');
        router.push('/');
      }
      setLoading(false);
    }, (error) => {
      toast.error(`Error loading course: ${error.message}`);
      setLoading(false);
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <ToastContainer />
      <header className="bg-white shadow p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <FaFolder className="mr-2 text-yellow-500" /> {course.name}
          </h1>
          <Link href="/">
            <a className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <FaArrowLeft className="mr-2" /> Back to Courses
            </a>
          </Link>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Course Content</h2>
          <ul className="space-y-2">
            {course.subfolders &&
              Object.entries(course.subfolders).map(([subfolder, files]) => (
                <li key={subfolder} className="bg-gray-100 rounded p-2">
                  <div className="flex items-center mb-2">
                    <FaFolder className="text-blue-500 mr-2" />
                    {subfolder}
                  </div>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-white p-2 rounded ml-4 mt-1 hover:bg-blue-50"
                    >
                      <Link href={`/view?pdfid=${file.pdfId}`}>
                        <a className="text-blue-600 flex items-center">
                          <FaFilePdf className="mr-2" />
                          {file.name}
                        </a>
                      </Link>
                      <span className="text-gray-500 text-sm">
                        {new Date(file.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </li>
              ))}
            {course.files &&
              course.files.map((file, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-white p-2 rounded hover:bg-blue-50"
                >
                  <Link href={`/view?pdfid=${file.pdfId}`}>
                    <a className="text-blue-600 flex items-center">
                      <FaFilePdf className="mr-2" />
                      {file.name}
                    </a>
                  </Link>
                  <span className="text-gray-500 text-sm">
                    {new Date(file.date).toLocaleDateString()}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
