import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { toast } from 'react-toastify';

export default function CoursePage() {
  const router = useRouter();
  const { courseId } = router.query;
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const fetchCourse = async () => {
      const db = getDatabase();
      const courseRef = ref(db, `courses/${courseId}`);
      const courseSnapshot = await get(courseRef);
      if (courseSnapshot.exists()) {
        const courseData = courseSnapshot.val();
        setCourse({
          id: courseId,
          name: courseData.name || courseId,
          files: Object.values(courseData.files || {}),
        });
      }

      if (auth.currentUser) {
        const purchaseRef = ref(db, `purchases/${auth.currentUser.uid}/${courseId}`);
        const purchaseSnapshot = await get(purchaseRef);
        setHasPurchased(purchaseSnapshot.exists());
      }

      setIsLoading(false);
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, auth.currentUser]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-20">Course not found</div>;
  }

  if (!hasPurchased) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-center mb-4">{course.name}</h1>
            <p className="text-center text-gray-600">
              You need to purchase this course to access the materials.
            </p>
            <div className="text-center mt-6">
              <button
                onClick={() => router.push(`/checkout?courseId=${courseId}&courseName=${course.name}&amount=${course.price || 10}`)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Purchase Now
              </button>
            </div>
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
          <h1 className="text-3xl font-bold text-center mb-8">{course.name}</h1>
          <div className="grid grid-cols-1 gap-4">
            {course.files.map((file) => (
              <a
                key={file.pdfId}
                href={`/view?pdfId=${file.pdfId}`}
                className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {file.name}
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
