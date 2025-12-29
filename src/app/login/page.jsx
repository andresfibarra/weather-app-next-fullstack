'use client';
// src/app/auth/login/page.jsx
import { login, signup } from './actions';
import React from 'react';
import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldSet,
  FieldDescription,
  FieldSeparator,
  FieldError,
} from '@/components/ui/field';

export default function LoginPage() {
  const [loginState, loginAction, isPending] = useActionState(login, null);

  return (
    <form className="flex flex-col gap-4 w-2xl mx-auto border border-slate-300 rounded-md p-4">
      <Field className="w-max-content">
        <FieldSet className="text-xl font-bold">Welcome!</FieldSet>
        <FieldDescription className="text-md">
          Please enter your email and password to proceed.
        </FieldDescription>
        {loginState?.error && <FieldError>Error: {loginState.error}</FieldError>}
        <FieldSeparator />

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldDescription>For testing, use email: test@test.com</FieldDescription>
            <Input
              id="email"
              name="email"
              type="email"
              className="border border-slate-300 rounded-md p-2"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password:</FieldLabel>
            <FieldDescription>For testing, use password: password123</FieldDescription>
            <Input
              id="password"
              name="password"
              type="password"
              className="border border-slate-300 rounded-md p-2"
              required
            />
          </Field>

          <Field>
            <Button variant="outline" formAction={loginAction} className="text-md">
              Log in
            </Button>
            <Button variant="secondary" formAction={signup} className="text-md">
              Sign up
            </Button>
          </Field>
        </FieldGroup>
      </Field>
    </form>
  );
}
