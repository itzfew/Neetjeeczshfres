import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth, database } from '../../firebase';
import { get, ref } from 'firebase/database';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { toast } from 'react-toastify';

export default function CoursePage() {
  const router = useRouter();
  const { courseName } = router.query;
  const [course, setCourse] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      toast.error('Please sign in to view the course');
      router.push('/login');
      return;
    }

    const fetchCourse = async () => {
      const coursesRef = ref(database, 'files');
      const userRef = ref(database, `users/${auth.currentUser.uid}/purchases`);
      const [courseSnapshot, userSnapshot] = await Promise.all([get(coursesRef), get(userRef)]);

      if (courseSnapshot.exists()) {
        const data = courseSnapshot.val();
        const courseFiles = Object.values(data).filter((file) => file.folder === courseName);
        if (courseFiles.length > 0) {
          setCourse({
            name: courseName,
            price: courseName === 'Pw' ? 5 : 10,
            files: courseFiles.map((file) => ({
              name: file.name,
              url: file.url,
              pdfId: file.pdfId,
            })),
          });
        }
      setIsPurchased(userSnapshot.exists() && userSnapshot.val()[courseName]);
      setIsLoading(false);
    };

    fetchCourse();
  }, [courseName]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!course || !isPurchased) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <p className="text-center text-gray-600">
              {course ? 'Please purchase this course to access the materials.' : 'Course not found.'}
            </p>
            {course && (
              <div className="text-center">
                <button
                  onClick={() => router.push(`/checkout?courseName=${courseName}&amount=${course.price}`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Purchase Now
                </button>
              </div>
            )}
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
          <h1 className="text-3xl font-bold mb-8">{course.name}</h1>
          <div className="space-y-4">
            {course.files.map((file) => (
              <div key={file.pdfId} className="bg-white p-4 rounded-lg shadow">
                <Link href={`/view?pdfId=${file.pdfId}`}>
                  <a className="text-indigo-600 hover:text-indigo-800">{file.name}</a>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
