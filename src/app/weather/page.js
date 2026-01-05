// src/app/weather/page.jsx
'use client';

import Weather from './components/weather';
import {
  TypographyH1,
  TypographyH3,
  TypographyH4,
  TypographyMuted,
} from '@/components/ui/typography';

import { Card, CardTitle, CardDescription, CardHeader, CardContent } from '@/components/ui/card';

export default function WeatherPage() {
  return (
    <div className="space-y-4">
      <TypographyH1>Welcome to my project!</TypographyH1>
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
        <Card
          className="cursor-pointer w-full hover:bg-accent transition-background duration-300 max-w-sm"
          onClick={() => console.log('click!')}
        >
          <CardHeader>
            <CardTitle>WeatherApp</CardTitle>
            <CardDescription>
              Get the weather information for your city or any city in the world
            </CardDescription>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
        <Card
          className="cursor-pointer w-full hover:bg-accent transition-background duration-300 max-w-sm"
          onClick={() => console.log('click2!')}
        >
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
