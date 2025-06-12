import axios from 'axios';
import { getDatabase, ref, set } from 'firebase-admin/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, folder, amount } = req.body;

  try {
    const response = await axios.post(
      'https://api.cashfree.com/pg/orders',
      {
        order_amount: amount,
        order_currency: 'INR',
        order_id: `order_${Date.now()}`,
        customer_details: {
          customer_id: userId,
          customer_email: 'user@example.com',
          customer_phone: '1234567890',
        },
        order_meta: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/view?orderId={order_id}`,
        },
      },
      {
        headers: {
          'x-api-version': '2022-09-01',
          'x-client-id': process.env.CASHFREE_CLIENT_ID,
          'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
        },
      }
    );

    // Temporarily store order details
    const db = getDatabase();
    await set(ref(db, `orders/${response.data.order_id}`), {
      userId,
      folder,
      status: 'pending',
    });

    res.status(200).json({
      orderId: response.data.order_id,
      paymentSessionId: response.data.payment_session_id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
