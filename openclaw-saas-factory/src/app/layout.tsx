import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OpenClaw SaaS Factory',
  description: 'AI-powered factory to generate and deploy real SaaS applications.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#080c10] text-[#e2eaf4]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
