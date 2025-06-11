import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../firebase';
import { get, ref, set } from 'firebase/database';
import { database } from '../firebase';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function ProductCard({ course, purchasedCourses }) {
  const router = useRouter();
  const [isPurchased, setIsPurchased] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (user && purchasedCourses) {
      setIsPurchased(purchasedCourses.includes(course.name));
    }
  }, [user, purchasedCourses, course.name]);

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please sign in to purchase a course');
      router.push('/login');
      return;
    }

    router.push({
      pathname: '/checkout',
      query: {
        courseName: course.name,
        amount: course.price,
      },
    });
  };

  const handleViewCourse = () => {
    if (!user) {
      toast.error('Please sign in to view the course');
      router.push('/login');
      return;
    }
    if (!isPurchased) {
      toast.error('Please purchase the course to access it');
      return;
    }
    router.push(`/course/${course.name}`);
  };

  return (
    <div className="product-card bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
      <Link href={`/course/${course.name}`}>
        <div className="image-container relative w-full h-64">
          <Image
            src={course.image || '/default-course.jpg'}
            alt={course.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      <div className="content p-6 flex flex-col">
        <Link href={`/course/${course.name}`}>
          <h2 className="text-xl font-semibold text-gray-800 mb-2 hover:text-indigo-600 transition-colors">
            {course.name}
          </h2>
        </Link>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
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
