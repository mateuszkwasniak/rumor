import Navbar from "@/components/navbar/Navbar";
import { SessionProvider } from "next-auth/react";
import "@/styles/globals.css";
import { AnimatePresence } from "framer-motion";
import RoomContextProvider from "@/store/room-ctx";

export default function App({ Component, pageProps, router }) {
  return (
    <RoomContextProvider>
      <SessionProvider session={pageProps.session}>
        <Navbar />
        <AnimatePresence mode="wait">
          <Component {...pageProps} key={router.asPath} />
        </AnimatePresence>
      </SessionProvider>
    </RoomContextProvider>
  );
}
