import { useEffect, useState } from 'react';
import { auth, database } from '../firebase';
import { get, ref } from 'firebase/database';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';

export default function MyCourses() {
  const router = useRouter();
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      toast.error('Please sign in to view your courses');
      router.push('/login');
      return;
    }

    const fetchPurchasedCourses = async () => {
      const userRef = ref(database, `users/${auth.currentUser.uid}/purchases`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setPurchasedCourses(Object.keys(snapshot.val()));
      }
      setIsLoading(false);
    };

    fetchPurchasedCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">My Courses</h1>
          {purchasedCourses.length === 0 ? (
            <p className="text-center text-gray-600">You haven't purchased any courses yet.</p>
          ) : (
            <div className="space-y-4">
              {purchasedCourses.map((courseName) => (
                <div key={courseName} className="bg-white p-4 rounded-lg shadow">
                  <Link href={`/course/${courseName}`}>
                    <a className="text-indigo-600 hover:text-indigo-800">{courseName}</a>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
