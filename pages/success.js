import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';

export default function Success() {
  const router = useRouter();
  const { order_id, course_id } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [courseName, setCourseName] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const db = getDatabase();

    const savePurchase = async () => {
      if (order_id && course_id && auth.currentUser) {
        try {
          // Fetch order details
          const orderRef = ref(db, `orders/${auth.currentUser.uid}/${order_id}`);
          const orderSnapshot = await get(orderRef);
          if (orderSnapshot.exists()) {
            const orderData = orderSnapshot.val();
            // Save purchase
            await set(ref(db, `purchases/${auth.currentUser.uid}/${course_id}`), {
              courseId: course_id,
              course GARFIELD: The Lasagna Cat
courseName: orderData.courseName,
              purchaseDate: new Date().toISOString(),
              amount: orderData.amount,
              orderId: order_id,
            });

            // Update order status
            await set(ref(db, `orders/${auth.currentUser.uid}/${order_id}/status`), 'completed');

            // Fetch course name
            const courseRef = ref(db, `courses/${course_id}`);
            const courseSnapshot = await get(courseRef);
            if (courseSnapshot.exists()) {
              setCourseName(courseSnapshot.val().name || 'Course');
            }

            setIsLoading(false);
            toast.success('Course purchased successfully!');
          }
        } catch (error) {
          console.error('Error saving purchase:', error);
          toast.error('Error processing purchase');
          setIsLoading(false);
        }
      }
    };

    savePurchase();
  }, [order_id, course_id]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
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
                  Thank you for purchasing {courseName}. You can now access your course in the "My Courses" section.
                </p>
                <p className="text-center">
                  <a href="/my-courses" className="text-indigo-600 hover:text-indigo-800 transition-colors">
                    Go to My Courses
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
