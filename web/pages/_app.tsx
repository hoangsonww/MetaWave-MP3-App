import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";
import MetaUpdater from "@/components/MetaUpdater";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <MetaUpdater />
      <Component {...pageProps} />
      <Toaster theme="dark" position="bottom-right" />
    </>
  );
}
