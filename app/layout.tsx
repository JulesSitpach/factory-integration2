import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

// Initialize the Inter font with Latin subset
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Metadata for SEO and social sharing
export const metadata: Metadata = {
  title: {
    template: '%s | TradeNavigatorPro',
    default: 'TradeNavigatorPro - Navigate Trade Policy and Tariff Volatility',
  },
  description:
    'AI-powered tools helping US SMBs navigate global trade uncertainty, calculate tariffs, optimize supply chains, and protect margins.',
  keywords: [
    'trade policy',
    'tariffs',
    'supply chain',
    'SMB',
    'import',
    'export',
    'pricing strategy',
    'trade route',
  ],
  authors: [{ name: 'TradeNavigatorPro Team' }],
  creator: 'TradeNavigatorPro',
  publisher: 'TradeNavigatorPro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tradenavigatorpro.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en',
      'es-ES': '/es',
    },
  },
  openGraph: {
    title: 'TradeNavigatorPro - Navigate Trade Policy and Tariff Volatility',
    description:
      'AI-powered tools helping US SMBs navigate global trade uncertainty, calculate tariffs, optimize supply chains, and protect margins.',
    url: 'https://tradenavigatorpro.com',
    siteName: 'TradeNavigatorPro',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TradeNavigatorPro - Navigate Trade Policy and Tariff Volatility',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TradeNavigatorPro - Navigate Trade Policy and Tariff Volatility',
    description:
      'AI-powered tools helping US SMBs navigate global trade uncertainty, calculate tariffs, optimize supply chains, and protect margins.',
    images: ['/images/twitter-image.jpg'],
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
};

// Viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#2D3748' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Set the language based on the locale parameter or default to English
  const lang = params?.locale || 'en';

  return (
    <html lang={lang} className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <div className="flex-grow">
          {/* The main content will be rendered here */}
          {children}
        </div>

        {/* Scripts that need to be loaded at the end */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Any critical client-side JavaScript can go here
              console.log('TradeNavigatorPro initialized');
            `,
          }}
        />
      </body>
    </html>
  );
}
