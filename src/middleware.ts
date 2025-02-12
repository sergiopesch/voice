import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    try {
        // Skip auth check for error page
        if (request.nextUrl.pathname === '/error') {
            return NextResponse.next();
        }

        // Check if required environment variables are set
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error('Missing Supabase environment variables');
            return NextResponse.redirect(new URL('/error', request.url));
        }

        // Create a response object to modify
        const res = NextResponse.next();

        try {
            // Create the Supabase client
            const supabase = createMiddlewareClient({ req: request, res });

            // Get the session
            const { data: { session } } = await supabase.auth.getSession();

            // Handle authentication redirects
            if (!session && !request.nextUrl.pathname.match(/^\/login|^\/error/)) {
                const redirectUrl = request.nextUrl.clone();
                redirectUrl.pathname = '/login';
                return NextResponse.redirect(redirectUrl);
            }

            if (session && request.nextUrl.pathname === '/login') {
                const redirectUrl = request.nextUrl.clone();
                redirectUrl.pathname = '/';
                return NextResponse.redirect(redirectUrl);
            }

            return res;
        } catch (supabaseError) {
            console.error('Supabase client error:', supabaseError);
            return NextResponse.redirect(new URL('/error', request.url));
        }
    } catch (error) {
        console.error('Middleware error:', error);
        return NextResponse.redirect(new URL('/error', request.url));
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/callback).*)'],
}; 