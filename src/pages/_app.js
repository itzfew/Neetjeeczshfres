// src/pages/_app.js
import Head from 'next/head';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <script src="https://sdk.cashfree.com/js/v3/cashfree.js" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
