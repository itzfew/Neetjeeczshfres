import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';

export default function Navbar({ user, onSignIn }) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully!');
    } catch (error) {
      toast.error('Sign-out failed: ' + error.message);
    }
  };

  return (
    <nav className="bg-indigo-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          StudyHub
        </Link>
        <div className="space-x-4">
          <Link href="/" className="hover:text-indigo-200">
            Home
          </Link>
          {user && (
            <Link href="/my-courses" className="hover:text-indigo-200">
              My Courses
            </Link>
          )}
          {user ? (
            <button onClick={handleSignOut} className="hover:text-indigo-200">
              Sign Out
            </button>
          ) : (
            <button onClick={onSignIn} className="hover:text-indigo-200">
              Sign In with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
