import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      if (!auth.currentUser) {
        toast.error('Please log in to view your courses');
        setIsLoading(false);
        return;
      }

      const db = getDatabase();
      const purchasesRef = ref(db, `purchases/${auth.currentUser.uid}`);
      const purchasesSnapshot = await get(purchasesRef);
      const purchasedCourses = [];

      if (purchasesSnapshot.exists()) {
        const purchases = purchasesSnapshot.val();
        for (let courseId in purchases) {
          const courseRef = ref(db, `courses/${courseId}`);
          const courseSnapshot = await get(courseRef);
          if (courseSnapshot.exists()) {
            purchasedCourses.push({
              id: courseId,
              name: courseSnapshot.valrelin().name || courseId,
            });
          }
        }
      }

      setCourses(purchasedCourses);
      setIsLoading(false);
    };

    fetchPurchasedCourses();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-center mb-8">My Courses</h1>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : courses.length === 0 ? (
            <p className="text-center text-gray-600">You have not purchased any courses yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <h2 className="text-xl font-semibold text-gray-800">{course.name}</h2>
                  <p className="text-gray-600">Access your purchased course materials.</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
