import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';

export default function CoursePage() {
  const router = useRouter();
  const { courseId } = router.query;
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        const db = getDatabase();
        const purchasesRef = ref(db, `purchases/${user.uid}/${courseId}`);
        onValue(purchasesRef, (snapshot) => {
          setIsPurchased(!!snapshot.val());
        });

        const filesRef = ref(db, 'files');
        onValue(filesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const courseFiles = Object.values(data).filter((file) => file.folder === courseId);
            setCourse({
              id: courseId,
              name: courseId,
              files: courseFiles,
            });
          }
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
        toast.error('Please sign in to view this course.');
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [courseId]);

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
              You have not purchased this course. Please{' '}
              <Link href="/" className="text-indigo-600 hover:text-indigo-800">
                purchase it
              </Link>{' '}
              to access the materials.
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
          <h1 className="text-3xl font-bold text-center mb-12">{course.name}</h1>
          <div className="grid grid-cols-1 gap-4">
            {course.files.map((file) => (
              <Link
                key={file.pdfId}
                href={`/view?pdfId=${file.pdfId}`}
                className="p-4 bg-white rounded-lg shadow hover:bg-gray-100"
              >
                {file.name}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
