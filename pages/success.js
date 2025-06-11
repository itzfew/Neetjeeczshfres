import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Success() {
  const router = useRouter();
  const { course_id } = router.query;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    if (course_id && auth.currentUser) {
      setTimeout(() => {
        router.push(`/courses/${course_id}`);
      }, 5000); // Redirect after 5 seconds
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [course_id]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <ToastContainer />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="success-card">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-center mb-4">Payment Successful!</h1>
                <p className="text-center text-gray-600 mb-6">
                  Thank you for your purchase. You will be redirected to your course in 5 seconds.
                </p>
                <p className="text-center">
                  <a
                    href={`/courses/${course_id}`}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Click here to go to your course now
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
