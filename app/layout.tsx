import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
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
