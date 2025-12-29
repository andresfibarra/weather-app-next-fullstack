// src/app/auth/login/page.jsx
import { login, signup } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Field,
  FieldGroup,
  FieldSet,
  FieldDescription,
  FieldSeparator,
} from '@/components/ui/field';

export default function LoginPage() {
  return (
    <form className="flex flex-col gap-4 w-2xl mx-auto border border-slate-300 rounded-md p-4">
      <Field className="w-max-content">
        <FieldSet className="text-xl font-bold">Welcome!</FieldSet>
        <FieldDescription className="text-md">
          Please enter your email and password to proceed.
        </FieldDescription>
        <FieldSeparator />
        <FieldGroup>
          <Field>
            <Label htmlFor="email" className="text-md font-bold">
              Email:
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              className="border border-slate-300 rounded-md p-2"
              required
            />
          </Field>
          <Field>
            <Label htmlFor="password" className="text-md font-bold">
              Password:
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
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
  );
}
