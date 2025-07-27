import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="scroll-smooth">
      <Head>
        {/* Primary Meta Tags */}
        <meta charSet="utf-8" />
        <title>MetaWave — Your Personal Music Library & Sharing Hub</title>
        <meta
          name="description"
          content="MetaWave lets you upload MP3s, batch‑update artwork, organize drag‑sortable albums, manage rich metadata & share public profiles in a sleek, theme‑aware UI."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* PWA Manifest & Theme */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#1e9df1" />

        {/* Favicons */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://metawave.app" />
        <meta
          property="og:title"
          content="MetaWave — Your Personal Music Library & Sharing Hub"
        />
        <meta
          property="og:description"
          content="Upload MP3s, organize drag‑sortable albums, batch‑update artwork & share public profiles in one sleek interface."
        />
        <meta
          property="og:image"
          content="https://metawave.app/android-chrome-512x512.png"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@sonnguyenhoang" />
        <meta
          name="twitter:title"
          content="MetaWave — Your Personal Music Library & Sharing Hub"
        />
        <meta
          name="twitter:description"
          content="Upload MP3s, organize drag‑sortable albums, batch‑update artwork & share public profiles in one sleek interface."
        />
        <meta
          name="twitter:image"
          content="https://metawave.app/android-chrome-512x512.png"
        />

        {/* Sitemap */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </Head>
      <body className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 text-neutral-100 antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
