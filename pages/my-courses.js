import { useEffect, useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function MyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      if (user) {
        const db = getDatabase();
        const purchasesRef = ref(db, `purchases/${user.uid}/courses`);
        const filesRef = ref(db, 'files');
        try {
          const [purchasesSnapshot, filesSnapshot] = await Promise.all([get(purchasesRef), get(filesRef)]);
          if (purchasesSnapshot.exists() && filesSnapshot.exists()) {
            const purchasedCourses = purchasesSnapshot.val();
            const files = filesSnapshot.val();
            const courseMap = {};
            Object.values(files).forEach((file) => {
              if (purchasedCourses[file.folder] && !courseMap[file.folder]) {
                courseMap[file.folder] = {
                  folder: file.folder,
                  price: file.folder === 'Pw' ? 5 : file.folder === 'Xgnccgnf' ? 10 : 15,
                  telegramLink: file.telegramLink || 'https://t.me/your_default_channel',
                };
              }
            });
            setCourses(Object.values(courseMap));
          }
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching purchased courses:', error);
          toast.error('Failed to load purchased courses.');
          setIsLoading(false);
        }
      } else {
        toast.error('Please sign in to view your courses.');
        setIsLoading(false);
      }
    };
    fetchPurchasedCourses();
  }, [user]);

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
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course.folder} className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold mb-2">{course.folder}</h2>
                  <Link href={`/courses/${course.folder}`} className="text-indigo-600 hover:text-indigo-800">
                    View Course
                  </Link>
                </div>
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
