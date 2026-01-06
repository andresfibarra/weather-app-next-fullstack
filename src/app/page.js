// src/app/page.jsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/utils/hooks/useAuth';
import {
  TypographyH1,
  TypographyH3,
  TypographyH4,
  TypographyMuted,
} from '@/components/ui/typography';

import { Spinner } from '@/components/ui/spinner';
import { Card, CardTitle, CardDescription, CardHeader, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const { isAuthed, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isAuthed ? (
        <TypographyH1>Welcome back!</TypographyH1>
      ) : (
        <TypographyH1>Welcome to my project!</TypographyH1>
      )}
      <TypographyH4>This is what I used:</TypographyH4>
      <div>
        <TypographyMuted>
          It uses the OpenWeather and Geoapify API to get the weather information.
        </TypographyMuted>
        <TypographyMuted>
          It uses Supabase to handle authentication and the Supabase database to store the weather
          information.
        </TypographyMuted>
        <TypographyMuted>
          It uses the Zustand store to manage the weather information.
        </TypographyMuted>
        <TypographyMuted>
          It uses the Tailwind CSS and shadcn/ui framework to style the app.
        </TypographyMuted>
        <TypographyMuted>It uses the React library to build the app.</TypographyMuted>
        <TypographyMuted>It uses the Next.js framework to build the app.</TypographyMuted>
        <TypographyMuted>It uses the Vercel platform to deploy the app.</TypographyMuted>
      </div>
      <TypographyH3>Click on the page you want to use:</TypographyH3>
      <div className="flex flex-row gap-4">
        <Link href="/weather" className="w-full max-w-sm">
          <Card className="cursor-pointer w-full hover:bg-accent transition-background duration-300 max-w-sm">
            <CardHeader>
              <CardTitle>WeatherApp</CardTitle>
              <CardDescription>
                Get the weather information for your city or any city in the world
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Card className="cursor-pointer w-full hover:bg-accent transition-background duration-300 max-w-sm">
          <CardHeader>
            <CardTitle>AI Weather Assistant</CardTitle>
            <CardDescription>
              Ask an AI asssitant for weather information help with dressing, and more
            </CardDescription>
          </CardHeader>
          <CardContent>Coming soon!</CardContent>
        </Card>
      </div>
    </div>
  );
}
