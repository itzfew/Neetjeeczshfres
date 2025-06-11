import { useEffect, useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import firebaseApp from '../lib/firebase';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [purchasedCourses, setPurchasedCourses] = useState([]);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        const db = getDatabase();
        const purchasesRef = ref(db, `purchases/${user.uid}`);
        onValue(purchasesRef, (snapshot) => {
          const data = snapshot.val();
          setPurchasedCourses(data ? Object.keys(data) : []);
        });
      }
    });

    const db = getDatabase();
    const filesRef = ref(db, 'files');
    onValue(filesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const courseList = Object.values(data).reduce((acc, file) => {
          if (!acc[file.folder]) {
            acc[file.folder] = {
              id: file.folder,
              name: file.folder,
              price: file.folder === 'Pw' ? 5 : 10, // Example pricing
              files: [],
            };
          }
          acc[file.folder].files.push(file);
          return acc;
        }, {});
        setCourses(Object.values(courseList));
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Signed in successfully!');
    } catch (error) {
      toast.error('Sign-in failed: ' + error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} onSignIn={handleSignIn} />
      <ToastContainer />
      <main className="flex-grow">
        <div className="hero bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Your Next Favorite Course</h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Explore our curated collection of premium study materials to excel in your learning journey.
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
                  <ProductCard
                    key={course.id}
                    course={course}
                    isPurchased={purchasedCourses.includes(course.id)}
                    user={user}
                  />
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
