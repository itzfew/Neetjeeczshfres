import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function CoursePage() {
  const router = useRouter();
  const { courseId } = router.query;
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (courseId && user) {
        const db = getDatabase();
        const filesRef = ref(db, 'files');
        const purchaseRef = ref(db, `purchases/${user.uid}/courses/${courseId}`);
        try {
          const [filesSnapshot, purchaseSnapshot] = await Promise.all([get(filesRef), get(purchaseRef)]);
          if (filesSnapshot.exists()) {
            const files = filesSnapshot.val();
            const courseFiles = Object.values(files).filter((file) => file.folder === courseId);
            if (courseFiles.length > 0) {
              setCourse({
                folder: courseId,
                pdfs: courseFiles,
                price: courseId === 'Pw' ? 5 : courseId === 'Xgnccgnf' ? 10 : 15,
                telegramLink: courseFiles[0].telegramLink || 'https://t.me/your_default_channel',
              });
            }
          }
          setIsPurchased(purchaseSnapshot.exists());
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching course:', error);
          toast.error('Failed to load course data.');
          setIsLoading(false);
        }
      } else {
        setIsLoading(0);
      }
    };
    fetchCourse();
  }, [courseId, user]);

  const handleBuyNow = () => {
    if (!user) {
      toast.error('Please sign in to purchase this course.');
      return;
    }
    router.push({
      pathname: '/checkout',
      query: {
        courseId,
        courseName: courseId,
        amount: course.price,
        telegramLink: course.telegramLink,
      },
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : course ? (
            <>
              <h1 className="text-3xl font-bold text-center mb-8">{course.folder}</h1>
              {isPurchased ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Course Materials</h2>
                  <ul className="space-y-2">
                    {course.pdfs.map((pdf) => (
                      <li key={pdf.pdfId}>
                        <Link href={`/view?pdfId=${pdf.pdfId}`} className="text-indigo-600 hover:text-indigo-800">
                          {pdf.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Please purchase this course to access the materials.</p>
                  <button
                    onClick={handleBuyNow}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Buy Now (₹{course.price})
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-600">Course not found.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
