import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    await signInWithGoogle();
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4">Sign In</h1>
            <button
              onClick={handleLogin}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
