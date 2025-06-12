import axios from 'axios';
import { getDatabase, ref, set, get } from 'firebase-admin/database';

export default async function handler(req, res) {
  const { orderId, userId } = req.query;

  try {
    const response = await axios.get(`https://api.cashfree.com/pg/orders/${orderId}`, {
      headers: {
        'x-api-version': '2022-09-01',
        'x-client-id': process.env.CASHFREE_CLIENT_ID,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
      },
    });

    if (response.data.order_status === 'PAID') {
      const db = getDatabase();
      const orderRef = ref(db, `orders/${orderId}`);
      const orderSnapshot = await get(orderRef);
      const { folder } = orderSnapshot.val();

      await set(ref(db, `purchases/${userId}/${folder}`), { purchased: true });
      await set(ref(db, `orders/${orderId}/status`), 'completed');

      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, error: 'Payment not completed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
