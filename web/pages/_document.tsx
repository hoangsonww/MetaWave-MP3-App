import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="scroll-smooth">
      <Head />
      <body className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 text-neutral-100 antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
