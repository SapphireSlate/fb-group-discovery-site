import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Facebook Group Finder - Discover Valuable Facebook Groups',
    template: '%s | Facebook Group Finder'
  },
  description: 'Discover, share, and rate Facebook groups. Find valuable communities for networking, business growth, and connecting with like-minded people. Browse thousands of curated Facebook groups by category.',
  keywords: ['Facebook groups', 'group finder', 'community discovery', 'networking', 'business groups', 'social media', 'communities'],
  authors: [{ name: 'Facebook Group Finder' }],
  creator: 'Facebook Group Finder',
  publisher: 'Facebook Group Finder',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Facebook Group Finder - Discover Valuable Facebook Groups',
    description: 'Discover, share, and rate Facebook groups. Find valuable communities for networking, business growth, and connecting with like-minded people.',
    url: '/',
    siteName: 'Facebook Group Finder',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Facebook Group Finder - Discover Valuable Facebook Groups',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Facebook Group Finder - Discover Valuable Facebook Groups',
    description: 'Discover, share, and rate Facebook groups. Find valuable communities for networking, business growth, and connecting with like-minded people.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Simple cookie/consent banner placeholder */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try{
              var key='fgd-consent';
              if(localStorage.getItem(key)) return;
              var b=document.createElement('div');
              b.style.position='fixed';b.style.bottom='0';b.style.left='0';b.style.right='0';b.style.zIndex='9999';
              b.style.background='#111827';b.style.color='#fff';b.style.padding='12px';b.style.display='flex';b.style.justifyContent='space-between';b.style.alignItems='center';
              b.innerHTML='<span style="font-size:12px;">We use cookies for analytics and to improve ads relevance. By using this site you agree to our <a href="/privacy" style="text-decoration:underline;color:#93c5fd;">Privacy Policy</a>.</span> <button id="fgd-consent-accept" style="background:#2563eb;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:12px;">Accept</button>';
              document.body.appendChild(b);
              document.getElementById('fgd-consent-accept').onclick=function(){localStorage.setItem(key,'1');b.remove();}
            }catch(e){}
          })();
        `}} />
      </body>
    </html>
  )
}
