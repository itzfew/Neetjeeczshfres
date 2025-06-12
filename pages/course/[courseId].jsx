import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaFolder, FaFilePdf, FaSignOutAlt, FaSearch, FaSpinner } from 'react-icons/fa';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export default function Home() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [openCourse, setOpenCourse] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchCourses();
      } else {
        setUser(null);
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchCourses = () => {
    setLoading(true);
    const coursesRef = ref(database, 'courses');
    onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      const coursesData = {};
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          coursesData[key] = value;
        });
      }
      setCourses(coursesData);
      setLoading(false);
    }, (error) => {
      toast.error(`Error loading courses: ${error.message}`);
      setLoading(false);
    });
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Logged in successfully!');
      router.push('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
      setCourses({});
      router.push('/login');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const toggleCourse = (courseId) => {
    setOpenCourse(openCourse === courseId ? null : courseId);
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <ToastContainer />
      <div className="container mx-auto bg-white rounded-xl shadow-xl p-8 max-w-4xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaFolder className="mr-2 text-yellow-500" /> Study Courses
          </h1>
          {user && (
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Search courses..."
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleSearch}
                value={searchQuery}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                onClick={fetchCourses}
              >
                <FaSearch className="mr-2" /> Refresh
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
        {loading && (
          <div className="flex justify-center">
            <FaSpinner className="animate-spin h-10 w-10 text-blue-600" />
          </div>
        )}
        <div className="max-h-[70vh] overflow-y-auto">
          <ul className="space-y-2">
            {Object.entries(courses)
              .filter(([courseId, course]) =>
                course.name.toLowerCase().includes(searchQuery)
              )
              .map(([courseId, course]) => (
                <li
                  key={courseId}
                  className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleCourse(courseId)}
                >
                  <div className="flex items-center">
                    <FaFolder className="text-yellow-500 mr-2" />
                    <Link href={`/course/${courseId}`}>
                      <a className="text-blue-600">{course.name}</a>
                    </Link>
                  </div>
                  {openCourse === courseId && (
                    <div className="collapsible-content pl-6 space-y-2 mt-2">
                      {course.subfolders &&
                        Object.entries(course.subfolders).map(([subfolder, files]) => (
                          <div key={subfolder} className="bg-gray-100 rounded p-2">
                            <div className="flex items-center">
                              <FaFolder className="text-blue-500 mr-2" />
                              {subfolder}
                            </div>
                            {files.map((file, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center bg-white p-2 rounded ml-4 mt-1 hover:bg-blue-50"
                              >
                                <Link href={`/view?pdfid=${file.pdfId}`}>
                                  <a className="text-blue-600 flex items-center">
                                    <FaFilePdf className="mr-2" />
                                    {file.name}
                                  </a>
                                </Link>
                                <span className="text-gray-500 text-sm">
                                  {new Date(file.date).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        ))}
                      {course.files &&
                        course.files.map((file, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center bg-white p-2 rounded hover:bg-blue-50"
                          >
                            <Link href={`/view?pdfid=${file.pdfId}`}>
                              <a className="text-blue-600 flex items-center">
                                <FaFilePdf className="mr-2" />
                                {file.name}
                              </a>
                            </Link>
                            <span className="text-gray-500 text-sm">
                              {new Date(file.date).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
