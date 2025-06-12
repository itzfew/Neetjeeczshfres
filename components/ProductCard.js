import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { getDatabase, ref, get } from 'firebase/database';

export default function ProductCard({ course }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPurchase = async () => {
      if (user) {
        const db = getDatabase();
        const purchaseRef = ref(db, `purchases/${user.uid}/courses/${course.folder}`);
        const snapshot = await get(purchaseRef);
        setIsPurchased(snapshot.exists());
      }
      setLoading(false);
    };
    checkPurchase();
  }, [user, course.folder]);

  const handleBuyNow = () => {
    if (!user) {
      toast.error('Please sign in to purchase this course.');
      return;
    }
    router.push({
      pathname: '/checkout',
      query: {
        courseId: course.folder,
        courseName: course.folder,
        amount: course.price,
        telegramLink: course.telegramLink || 'https://t.me/your_default_channel',
      },
    });
  };

  const handleViewPDFs = () => {
    if (!user) {
      toast.error('Please sign in to view this course.');
      return;
    }
    router.push(`/courses/${course.folder}`);
  };

  return (
    <div className="product-card bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
      <Link href={`/courses/${course.folder}`}>
        <div className="image-container relative w-full h-64">
          <Image
            src={course.image || '/default-book.jpg'}
            alt={course.folder}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      <div className="content p-6 flex flex-col">
        <Link href={`/courses/${course.folder}`}>
          <h2 className="text-xl font-semibold text-gray-800 mb-2 hover:text-indigo-600 transition-colors">
            {course.folder}
          </h2>
        </Link>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description || 'Learn with our premium study materials.'}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-indigo-600">₹{course.price}</span>
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          ) : isPurchased ? (
            <button
              onClick={handleViewPDFs}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View PDFs
            </button>
          ) : (
            <button
              onClick={handleBuyNow}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
