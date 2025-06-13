import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GenPost - AI-Powered Social Media Assistant',
  description: 'GenPost helps you create engaging social media content with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-[var(--color-crisp-white)] selection:bg-[var(--color-warm-blush)]/50 selection:text-[var(--color-deep-forest)]">
          {children}
        </div>
      </body>
    </html>
  );
}
