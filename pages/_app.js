import { AuthProvider } from '../contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <script src="https://sdk.cashfree.com/js/v3/cashfree.js" async></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js" async></script>
      </Head>
      <Component {...pageProps} />
      <ToastContainer />
    </AuthProvider>
  );
}
