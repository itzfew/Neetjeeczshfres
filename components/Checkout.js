// components/Checkout.js
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Checkout() {
  const router = useRouter();
  const { productId, productName, amount, telegramLink } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [paymentSessionId, setPaymentSessionId] = useState(null);
  const dropinRef = useRef(null);

  // Load Cashfree SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => console.log('Cashfree SDK loaded');
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      toast.error('Please fill in all fields.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      toast.error('Please enter a valid email.');
      return false;
    }
    if (!/^\d{10}$/.test(formData.customerPhone)) {
      toast.error('Please enter a valid 10-digit phone number.');
      return false;
    }
    return true;
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          productName,
          amount: parseFloat(amount),
          telegramLink,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payment order');
      }
      setPaymentSessionId(data.paymentSessionId);
    } catch (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  // Initialize Cashfree Drop-in Checkout
  useEffect(() => {
    if (paymentSessionId && window.Cashfree && dropinRef.current) {
      const cashfree = window.Cashfree({ mode: 'production' });
      const dropinConfig = {
        components: ['order-details', 'card', 'upi', 'app', 'netbanking'],
        orderToken: paymentSessionId,
        onSuccess: (data) => {
          toast.success('Payment successful!');
          router.push(`/success?order_id=${data.order.orderId}&product_id=${productId}`);
        },
        onFailure: (error) => {
          toast.error(`Payment failed: ${error.message}`);
          setIsLoading(false);
        },
        style: {
          backgroundColor: '#ffffff',
          color: '#1f2937',
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          errorColor: '#ef4444',
          theme: 'light',
          borderRadius: '0.375rem',
          buttonBackground: '#4f46e5',
          buttonText: '#ffffff',
        },
      };
      cashfree.dropin(dropinRef.current, dropinConfig);
      setIsLoading(false);
    }
  }, [paymentSessionId, router, productId]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow checkout-page">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Checkout</h1>
          <div className="checkout-card max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8">
            {!paymentSessionId ? (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Enter Your Details</h2>
                <form onSubmit={handleProceedToPayment} className="space-y-6">
                  <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="customerEmail"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone (10 digits)
                    </label>
                    <input
                      type="tel"
                      id="customerPhone"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="1234567890"
                      required
                    />
                  </div>
                  <div className="order-summary bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Order Summary</h3>
                    <p className="text-gray-600"><strong>Product:</strong> {productName || 'Loading...'}</p>
                    <p className="text-gray-600"><strong>Amount:</strong> ₹{amount || '0.00'}</p>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`proceed-button ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        'Proceed to Payment'
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="payment-container">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Complete Your Payment</h2>
                <div ref={dropinRef} className="cashfree-dropin"></div>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setPaymentSessionId(null)}
                    className="cancel-button"
                  >
                    Back to Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
