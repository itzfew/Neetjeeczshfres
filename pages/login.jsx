 import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaGoogle, FaTimes, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const router = useRouter();
  const { mode } = router.query;

  useEffect(() => {
    if (mode === 'signup') {
      setIsSignup(true);
    } else {
      setIsSignup(false);
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [mode, router]);

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
      router.push('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Logged in with Google successfully!');
      router.push('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Signed up successfully!');
      router.push('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignup) {
      handleSignup();
    } else {
      handleEmailLogin();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <ToastContainer />
      <div className="bg-white p-6 rounded-lg w-96 relative">
        <FaTimes
          className="absolute top-4 right-4 text-red-500 cursor-pointer text-xl"
          onClick={() => router.push('/')}
        />
        <h2 className="text-xl font-bold mb-4">{isSignup ? 'Signup' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-between mb-4">
            <button
              type="submit"
              className={`${
                isSignup ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
              } text-white px-4 py-2 rounded flex-1 mr-2 flex items-center justify-center`}
            >
              {isSignup ? <FaUserPlus className="mr-2" /> : <FaSignInAlt className="mr-2" />}
              {isSignup ? 'Signup' : 'Login'}
            </button>
            <button
              type="button"
              className={`${
                isSignup ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'
              } text-white px-4 py-2 rounded flex-1 ml-2 flex items-center justify-center`}
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? 'Cancel' : 'Signup'}
            </button>
          </div>
        </form>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded w-full flex items-center justify-center hover:bg-red-700"
          onClick={handleGoogleLogin}
        >
          <FaGoogle className="mr-2" /> Sign in with Google
        </button>
      </div>
    </div>
  );
}
