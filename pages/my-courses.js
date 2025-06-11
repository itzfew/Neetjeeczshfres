import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function MyCourses() {
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        const db = getDatabase();
        const purchasesRef = ref(db, `purchases/${user.uid}`);
        onValue(purchasesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setPurchasedCourses(Object.values(data));
          }
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
        toast.error('Please sign in to view your courses.');
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      <ToastContainer />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-center mb-12">My Courses</h1>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : purchasedCourses.length === 0 ? (
            <p className="text-center text-gray-600">
              You have not purchased any courses yet.{' '}
              <Link href="/" className="text-indigo-600 hover:text-indigo-800">
                Browse courses
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {purchasedCourses.map((course) => (
                <Link
                  key={course.courseId}
                  href={`/courses/${course.courseId}`}
                  className="p-4 bg-white rounded-lg shadow hover:bg-gray-100"
                >
                  {course.courseName}
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
