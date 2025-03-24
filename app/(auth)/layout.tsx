import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/src/lib/utils';
import '../globals.css';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn('h-full', fontSans.variable)} suppressHydrationWarning>
      <body className={cn('min-h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 font-sans antialiased')} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
