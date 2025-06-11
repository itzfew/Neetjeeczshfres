import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { auth, database } from '../firebase';
import { set, ref } from 'firebase/database';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Success() {
  const router = useRouter();
  const { course_name } = router.query;

  useEffect(() => {
    if (auth.currentUser && course_name) {
      const savePurchase = async () => {
        try {
          await set(ref(database, `users/${auth.currentUser.uid}/purchases/${course_name}`), {
            purchasedAt: new Date().toISOString(),
          });
          toast.success('Course purchased successfully!');
          setTimeout(() => {
            router.push(`/course/${course_name}`);
          }, 5000);
        } catch (error) {
          toast.error('Failed to save purchase: ' + error.message);
        }
      };
      savePurchase();
    }
  }, [course_name]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="success-card">
            <h1 className="text-3xl font-bold text-center mb-4">Payment Successful!</h1>
            <p className="text-center text-gray-600 mb-6">
              Thank you for purchasing {course_name}. You will be redirected to the course in 5 seconds.
            </p>
            <p className="text-center">
              <a href={`/course/${course_name}`} className="text-indigo-600 hover:text-indigo-800 transition-colors">
                Go to course now
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
