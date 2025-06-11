import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { get, ref } from 'firebase/database';
import { realtimeDb } from '../firebase';

export async function getServerSideProps() {
  return { props: {} }; // Prevent static generation
}

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const filesRef = ref(realtimeDb, 'files');
        const snapshot = await get(filesRef);
        if (snapshot.exists()) {
          const files = snapshot.val();
          const courseMap = {};
          Object.values(files).forEach((file) => {
            if (!courseMap[file.folder]) {
              courseMap[file.folder] = {
                name: file.folder,
                price: file.folder === 'Pw' ? 5 : file.folder === 'Xgnccgnf' ? 10 : 15,
                pdfs: [],
                description: file.description || 'Premium study materials', // Ensure description is set
              };
            }
            courseMap[file.folder].pdfs.push({
              name: file.name,
              url: file.url,
              pdfId: file.pdfId,
            });
          });
          setCourses(Object.values(courseMap));
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading courses:', error);
        setIsLoading(false);
      }
    };
    fetchCourses();
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
          ) : courses.length === 0 ? (
            <p className="text-center text-gray-600">No courses available.</p>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Courses</h2>
              <div className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <ProductCard key={course.name} course={course} />
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
