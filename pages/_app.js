// pages/_app.js
import { AppProvider } from '../context/appContext';
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
}
