import { useEffect } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Rating from './Rating';

export default function ProductCard({ course, isPurchased, user }) {
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => console.log('Cashfree SDK loaded');
    document.body.appendChild(script);
  }, []);

  const handleBuyNow = () => {
    if (!user) {
      toast.error('Please sign in to purchase this course.');
      return;
    }
    router.push({
      pathname: '/checkout',
      query: {
        courseId: course.id,
        courseName: course.name,
        amount: course.price,
      },
    });
  };

  const handleViewCourse = () => {
    if (!user) {
      toast.error('Please sign in to view this course.');
      return;
    }
    if (!isPurchased) {
      toast.error('Please purchase this course to access the materials.');
      return;
    }
    router.push(`/courses/${course.id}`);
  };

  return (
    <div className="product-card bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
      <Link href={`/courses/${course.id}`}>
        <div className="image-container relative w-full h-64">
          <Image
            src="/default-book.jpg"
            alt={course.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      <div className="content p-6 flex flex-col">
        <Link href={`/courses/${course.id}`}>
          <h2 className="text-xl font-semibold text-gray-800 mb-2 hover:text-indigo-600 transition-colors">
            {course.name}
          </h2>
        </Link>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.files.length} PDF(s) available</p>
        <Rating rating={4} />
        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-indigo-600">₹{course.price}</span>
          {isPurchased ? (
            <button
              onClick={handleViewCourse}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View Course
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
