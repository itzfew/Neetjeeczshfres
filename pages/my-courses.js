import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

export async function getServerSideProps() {
  return { props: {} }; // Prevent static generation
}

export default function MyCourses() {
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      if (loading || !user) return;
      const q = query(collection(db, 'purchases'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const purchasedCourses = querySnapshot.docs.map((doc) => ({
        name: doc.data().courseName,
      }));
      setCourses(purchasedCourses);
      setIsLoading(false);
    };
    fetchPurchasedCourses();
  }, [user, loading]);

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
          <h1 className="text-3xl font-bold text-center mb-12">My Courses</h1>
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <Link key={course.name} href={`/course/${course.name}`}>
                  <div className="p-4 bg-white rounded-lg shadow-md cursor-pointer hover:bg-gray-100">
                    <h3 className="text-lg font-semibold">{course.name}</h3>
                    <p className="text-indigo-600">View Course</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">You haven't purchased any courses yet.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
