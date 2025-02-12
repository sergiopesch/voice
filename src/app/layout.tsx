import './globals.css';
import { GeistSans } from 'geist/font/sans';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AuthProvider } from '@/components/AuthProvider';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Voice AI',
  description: 'Real-time voice interaction powered by AI',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;

  try {
    // Verify environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      redirect('/error');
    }

    const cookieStore = cookies();
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    });

    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch (error) {
    console.error('Error in RootLayout:', error);
    redirect('/error');
  }

  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <AuthProvider session={session}>{children}</AuthProvider>
      </body>
    </html>
  );
}
