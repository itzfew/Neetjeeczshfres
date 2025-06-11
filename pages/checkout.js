// pages/checkout.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import firebaseApp from '../lib/firebase';

export default function Checkout() {
  const router = useRouter();
  const { courseId, courseName, amount } = router.query;
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        setFormData({
          customerName: user.displayName || '',
          customerEmail: user.email || '',
          customerPhone: '',
        });
      } else {
        toast.error('Please sign in to proceed with the purchase.');
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      toast.error('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      const auth = getAuth(firebaseApp);
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          courseId,
          courseName,
          amount,
          ...formData,
        }),
      });
      const data = await response.json();
      if (data.success) {
        const cashfree = new window.Cashfree(data.paymentSessionId);
        cashfree.redirect();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Payment initiation failed: ' + error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      <ToastContainer />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-center mb-12">Checkout</h1>
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">{courseName}</h2>
            <p className="text-gray-600 mb-4">Amount: ₹{amount}</p>
            <form onSubmit={handlePayment}>
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
