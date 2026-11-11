import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/site-header';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk'
});

export const metadata: Metadata = {
  title: 'Shopwave Storefront | Modern E-Commerce Platform',
  description: 'Full-featured e-commerce storefront with product catalog, cart, secure checkout, and order tracking.',
  openGraph: {
    title: 'Shopwave Storefront | Modern E-Commerce Platform',
    description: 'Full-featured e-commerce storefront with product catalog, cart, secure checkout, and order tracking.',
    type: 'website',
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shopwave Storefront | Modern E-Commerce Platform',
    description: 'Full-featured e-commerce storefront with product catalog, cart, secure checkout, and order tracking.'
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} text-slate-100`}>
        <div className="min-h-screen">
          <SiteHeader />
          <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
