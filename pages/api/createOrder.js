// pages/api/createOrder.js
import axios from 'axios';
import firebaseApp from '../../lib/firebase';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { courseId, courseName, amount, customerName, customerEmail, customerPhone } = req.body;
  const authHeader = req.headers.authorization;

  if (!courseId || !courseName || !amount || !customerName || !customerEmail || !customerPhone) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

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
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?order_id={order_id}&course_id=${courseId}`,
          notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook`,
        },
        order_note: courseName,
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

    const paymentSessionId = response.data.payment_session_id;

    // Save purchase to Firebase
    const db = getDatabase(firebaseApp);
    await set(ref(db, `purchases/${userId}/${courseId}`), {
      courseId,
      courseName,
      amount,
      purchasedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      paymentSessionId,
      orderId,
      courseId,
    });
  } catch (error) {
    console.error('Error in createOrder:', error.message);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ success: false, error: 'Unauthorized: Token expired' });
    }
    return res.status(500).json({
      success: false,
      error: 'Failed to create Cashfree order: ' + error.message,
    });
  }
}
