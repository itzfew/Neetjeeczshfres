import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Success() {
  const router = useRouter();
  const { course_name, order_id } = router.query;
  const { user } = useAuth();

  useEffect(() => {
    const savePurchase = async () => {
      if (user && course_name && order_id) {
        try {
          await setDoc(doc(db, 'purchases', `${user.uid}_${course_name}`), {
            userId: user.uid,
            courseName: course_name,
            orderId: order_id,
            purchaseDate: new Date().toISOString(),
          });
          toast.success('Course purchased successfully!');
          setTimeout(() => {
            router.push(`/course/${course_name}`);
          }, 3000);
        } catch (error) {
          console.error('Error saving purchase:', error);
          toast.error('Failed to save purchase');
        }
      }
    };
    savePurchase();
  }, [user, course_name, order_id, router]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-center mb-4">Payment Successful!</h1>
          <p className="text-center text-gray-600 mb-6">
            Thank you for your purchase. You will be redirected to the course in 3 seconds.
          </p>
          <p className="text-center">
            <a href={`/course/${course_name}`} className="text-indigo-600 hover:text-indigo-800 transition-colors">
              Go to course now
            </a>
          </p>
        </div>
      </main>
      <Footer />
    );
  }
}
