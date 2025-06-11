import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { courseName, amount, customerName, customerEmail, customerPhone, userId } = req.body;

  if (!courseName || !amount || !customerName || !customerEmail || !customerPhone || !userId) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://neetjeeczshfres.vercel.app';
    const response = await axios.post(
      'https://api.cashfree.com/pg/orders',
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: userId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        order_meta: {
          return_url: `${baseUrl}/success?order_id={order_id}&course_name=${encodeURIComponent(courseName)}`,
        },
        order_note: `Course: ${courseName}`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2022-09-01',
          'x-client-id': process.env.CASHFREE_CLIENT_ID,
          'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
        },
      }
    );

    return res.status(200).json({
      success: true,
      paymentSessionId: response.data.payment_session_id,
      orderId,
      courseName,
    });
  } catch (error) {
    console.error('Cashfree order creation failed:', error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to create Cashfree order',
      details: error?.response?.data || error.message,
    });
  }
}
