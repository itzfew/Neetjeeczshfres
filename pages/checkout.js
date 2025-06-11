import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export async function getServerSideProps() {
  return { props: {} }; // Prevent static generation
}

export default function Checkout() {
  const router = useRouter();
  const { courseName, amount } = router.query;
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please sign in to proceed with checkout');
      router.push('/login');
    } else if (user) {
      setFormData({
        customerName: user.displayName || '',
        customerEmail: user.email || '',
        customerPhone: '',
      });
    }
  }, [user, loading, router]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName,
          amount,
          ...formData,
          userId: user.uid,
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
      console.error('Payment initiation failed:', error);
      toast.error('Payment initiation failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Course: {courseName}</h2>
            <p className="text-lg mb-4">Amount: ₹{amount}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <button
              onClick={handlePayment}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              disabled={!user}
            >
              Pay Now
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
