// src/app/auth/login/page.jsx
import { login, signup } from './actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldSet,
  FieldDescription,
  FieldSeparator,
} from '@/components/ui/field';
import { Card, CardContent } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardContent>
          <form>
            <Field className="w-max-content">
              <FieldSet className="text-xl font-bold">Welcome to WeatherApp!</FieldSet>
              <FieldDescription className="text-md">
                Please enter your email and password to proceed.
              </FieldDescription>
              <FieldSeparator />

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="For demo purposes, use andres21ibarra@gmail.com or enter your own email"
                    className="border border-slate-300 rounded-md p-2"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password:</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="For demo purposes, use password123 or enter your own password"
                    className="border border-slate-300 rounded-md p-2"
                    required
                  />
                </Field>

                <Field>
                  <Button variant="outline" formAction={login} className="text-md">
                    Log in
                  </Button>
                  <Button variant="secondary" formAction={signup} className="text-md">
                    Sign up
                  </Button>
                </Field>
              </FieldGroup>
            </Field>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
