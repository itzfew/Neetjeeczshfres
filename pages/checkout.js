import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Head from 'next/head';

export async function getServerSideProps() {
  return { props: {} }; // Prevent static generation
}

export default function Checkout() {
  const router = useRouter();
  const { courseName, amount } = router.query || {};
  const { user, loading } = useAuth() || { user: null, loading: true };
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState(null);

  // Load Cashfree SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      console.log('Cashfree SDK loaded successfully');
      setIsSdkLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Cashfree SDK');
      setSdkError('Failed to load payment SDK');
      setIsSdkLoaded(false);
      toast.error('Failed to load payment SDK. Please try again.');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Initialize form data and check user
  useEffect(() => {
    if (loading) return;
    if (!user) {
      console.log('No user found, redirecting to login');
      toast.error('Please sign in to proceed with checkout');
      router.push('/login');
    } else {
      console.log('User found:', user.uid);
      setFormData({
        customerName: user.displayName || '',
        customerEmail: user.email || '',
        customerPhone: '',
      });
    }
  }, [user, loading, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = async () => {
    console.log('Pay Now clicked');
    if (!user) {
      console.log('No user, cannot proceed');
      toast.error('Please sign in to proceed');
      return;
    }
    if (!isSdkLoaded) {
      console.log('SDK not loaded');
      toast.error('Payment SDK not loaded. Please try again.');
      return;
    }
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      console.log('Missing form fields:', formData);
      toast.error('Please fill in all required fields');
      return;
    }
    if (!courseName || !amount || isNaN(parseFloat(amount))) {
      console.log('Invalid course or amount:', { courseName, amount });
      toast.error('Invalid course or amount');
      return;
    }

    try {
      console.log('Initiating payment with data:', {
        courseName,
        amount,
        ...formData,
        userId: user.uid,
      });
      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName,
          amount: parseFloat(amount),
          ...formData,
          userId: user.uid,
        }),
      });

      const data = await response.json();
      console.log('API response:', data);
      if (data.success) {
        if (window.Cashfree) {
          console.log('Initializing Cashfree with session ID:', data.paymentSessionId);
          const cashfree = new window.Cashfree(data.paymentSessionId);
          cashfree.redirect();
        } else {
          console.error('Cashfree SDK not available');
          toast.error('Payment SDK not available');
        }
      } else {
        console.error('API error:', data.error, data.details);
        toast.error(data.error || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.error('Payment initiation failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (sdkError) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-center">Checkout Error</h1>
            <p className="text-center text-red-600">{sdkError}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!courseName || !amount) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-center">Checkout Error</h1>
            <p className="text-center text-red-600">Invalid course or amount. Please select a course.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>Checkout - StudyHub</title>
      </Head>
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
              className={`w-full py-2 rounded-lg transition-colors ${
                isSdkLoaded && user
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
              disabled={!isSdkLoaded || !user}
            >
              {isSdkLoaded ? 'Pay Now' : 'Loading Payment SDK...'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
