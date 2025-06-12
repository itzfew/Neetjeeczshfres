import { useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

export default function Login() {
  const router = useRouter();
  const auth = getAuth();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Logged in successfully!');
      router.push('/');
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      toast.error('Failed to log in with Google');
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      router.push('/');
    }
  }, [auth.currentUser, router]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center">
        <div className="p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">Login to Your Account</h1>
          <button
            onClick={handleGoogleSignIn}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </main>
    </div>
  );
}
