import { useEffect, useState } from 'react';
import { auth, database } from '../firebase';
import { get, ref } from 'firebase/database';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const coursesRef = ref(database, 'files');
      const snapshot = await get(coursesRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const courseMap = {};
        Object.values(data).forEach((file) => {
          if (!courseMap[file.folder]) {
            courseMap[file.folder] = {
              name: file.folder,
              price: file.folder === 'Pw' ? 5 : 10, // Example pricing
              description: `Learn with our premium ${file.folder} course materials.`,
              image: '/default-course.jpg',
              files: [],
            };
          }
          courseMap[file.folder].files.push({
            name: file.name,
            url: file.url,
            pdfId: file.pdfId,
          });
        });
        setCourses(Object.values(courseMap));
      }
      setIsLoading(false);
    };

    const fetchPurchasedCourses = async () => {
      if (auth.currentUser) {
        const userRef = ref(database, `users/${auth.currentUser.uid}/purchases`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setPurchasedCourses(Object.keys(snapshot.val()));
        }
      }
    };

    fetchCourses();
    fetchPurchasedCourses();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <ToastContainer />
      <main className="flex-grow">
        <div className="hero bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Your Next Course</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Explore our curated collection of premium study materials and courses.
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Courses</h2>
              <div className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <ProductCard key={course.name} course={course} purchasedCourses={purchasedCourses} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
