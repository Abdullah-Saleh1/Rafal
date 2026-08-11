import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'رفال العقارية',
  description: 'رفال العقارية — شراء وإيجار واستثمار',
}

const GA_ID = 'G-XXXXXXXXXX'

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-black">
        {children}

        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </body>
    </html>
  )
}
