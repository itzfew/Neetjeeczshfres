import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getDatabase, ref, set } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';

export default function Success() {
  const router = useRouter();
  const { course_id, order_id } = router.query;
  const { user } = useAuth();
  const [telegramLink, setTelegramLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && course_id) {
      const updatePurchase = async () => {
        try {
          const db = getDatabase();
          const filesRef = ref(db, 'files');
          const snapshot = await get(filesRef);
          if (snapshot.exists()) {
            const files = snapshot.val();
            const course = Object.values(files).find((file) => file.folder === course_id);
            if (course) {
              setTelegramLink(course.telegramLink || 'https://t.me/your_default_channel');
              // Update purchase in Firebase
              await set(ref(db, `purchases/${user.uid}/courses/${course_id}`), true);
              toast.success(`Successfully purchased ${course_id} course!`);
              setTimeout(() => {
                window.location.href = course.telegramLink || 'https://t.me/your_default_channel';
              }, 5000);
            } else {
              toast.error('Course not found.');
            }
          }
          setIsLoading(false);
        } catch (error) {
          console.error('Error updating purchase:', error);
          toast.error('Failed to process purchase.');
          setIsLoading(false);
        }
      };
      updatePurchase();
    } else {
      setIsLoading(false);
    }
  }, [user, course_id]);

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
            ) : telegramLink ? (
              <>
                <h1 className="text-3xl font-bold text-center mb-4">Payment Successful!</h1>
                <p className="text-center text-gray-600 mb-6">
                  Thank you for your purchase. You will be redirected to the course material in 5 seconds.
                </p>
                <p className="text-center">
                  <a href={telegramLink} className="text-indigo-600 hover:text-indigo-800 transition-colors">
                    Click here to join now
                  </a>
                </p>
              </>
            ) : (
              <p className="text-center text-gray-600">Error: Course link not found.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
