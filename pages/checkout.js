import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

export default function Checkout() {
  const router = useRouter();
  const { courseId, courseName, amount } = router.query;
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    if (!auth.currentUser) {
      toast.error('Please log in to proceed with checkout');
      router.push('/login');
    } else {
      setCustomerDetails({
        name: auth.currentUser.displayName || '',
        email: auth.currentUser.email || '',
        phone: '',
      });
    }
  }, [auth.currentUser, router]);

  const handleInputChange = (e) => {
    setCustomerDetails({
      ...customerDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          courseName,
          amount,
          telegramLink: '',
          customerName: customerDetails.name,
          customerEmail: customerDetails.email,
          customerPhone: customerDetails.phone,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const cashfree = new window.Cashfree(data.paymentSessionId);
        cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          redirect: {
            auto: false,
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?order_id=${data.orderId}&course_id=${courseId}`,
          },
        });
      } else {
        toast.error(data.error || 'Failed to initiate payment');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('An error occurred during checkout');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center">
        <div className="p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">Checkout</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Course Name</label>
              <input
                type="text"
                value={courseName}
                disabled
                className="w-full p-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Amount</label>
              <input
                type="text"
                value={`₹${amount}`}
                disabled
                className="w-full p-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={customerDetails.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={customerDetails.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={customerDetails.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
