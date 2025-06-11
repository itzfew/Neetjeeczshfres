import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Sign out failed: ' + error.message);
    }
  };

  return (
    <nav className="bg-indigo-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <a className="text-2xl font-bold">Course Platform</a>
        </Link>
        <div className="space-x-4">
          <Link href="/">Home</Link>
          {user && <Link href="/my-courses">My Courses</Link>}
          {user ? (
            <button onClick={handleSignOut} className="hover:underline">
              Sign Out
            </button>
          ) : (
            <Link href="/login">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
