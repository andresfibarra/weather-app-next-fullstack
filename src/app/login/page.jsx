// src/app/auth/login/page.jsx
import { login, signup } from './actions';

export default function LoginPage() {
  return (
    <form className="flex flex-col gap-4 w-2xl mx-auto border border-slate-300 rounded-md p-4">
      <label htmlFor="email" className="text-lg font-bold text-slate-400">
        Email:
      </label>
      <input
        id="email"
        name="email"
        type="email"
        className="border border-slate-300 rounded-md p-2"
        required
      />
      <label htmlFor="password" className="text-lg font-bold text-slate-400">
        Password:
      </label>
      <input
        id="password"
        name="password"
        type="password"
        className="border border-slate-300 rounded-md p-2"
        required
      />
      <button formAction={login} className="bg-gray-800 text-white rounded-md p-2">
        Log in
      </button>
      <button formAction={signup} className="bg-gray-800 text-white rounded-md p-2">
        Sign up
      </button>
    </form>
  );
}
