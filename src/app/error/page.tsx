'use client';

import Link from 'next/link';

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Configuration Error</h1>
        <p className="text-gray-600 mb-6">
          The application is not properly configured. Please ensure all required environment variables are set correctly.
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg text-left">
            <h2 className="font-semibold text-yellow-800 mb-2">Required Environment Variables:</h2>
            <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              <li>OPENAI_API_KEY</li>
              <li>MISTRAL_API_KEY</li>
              <li>GOOGLE_CLOUD_PROJECT_ID</li>
              <li>GOOGLE_CLOUD_CREDENTIALS</li>
            </ul>
          </div>
          <Link
            href="/"
            className="inline-block w-full px-4 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
} 