"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  kr: {
    title: "Konekte",
    subtitle: "Antre nan kont ou",
    email: "Imèl",
    password: "Modpas",
    signIn: "Konekte",
    signingIn: "Ap konekte...",
    noAccount: "Pa gen kont?",
    signUp: "Kreye youn",
    error: "Imèl oswa modpas pa kòrèk",
    emailPlaceholder: "ou@egzanp.com",
  },
  en: {
    title: "Sign In",
    subtitle: "Enter your account",
    email: "Email",
    password: "Password",
    signIn: "Sign In",
    signingIn: "Signing in...",
    noAccount: "Don't have an account?",
    signUp: "Create one",
    error: "Invalid email or password",
    emailPlaceholder: "you@example.com",
  },
};

export default function SignInPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-cream-50 border-2 border-earth-800 p-8 shadow-brutal">
          <h1 className="font-playfair text-3xl text-earth-900 mb-2">{t.title}</h1>
          <p className="text-earth-600 mb-6">{t.subtitle}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-earth-700 mb-1">
                {t.email}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                required
                className="w-full px-4 py-3 border-2 border-earth-300 bg-white focus:border-sage-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-earth-700 mb-1">
                {t.password}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-earth-300 bg-white focus:border-sage-600 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sage-700 text-cream-50 py-3 font-medium hover:bg-sage-800 disabled:bg-sage-400 transition-colors"
            >
              {loading ? t.signingIn : t.signIn}
            </button>
          </form>

          <p className="mt-6 text-center text-earth-600">
            {t.noAccount}{" "}
            <Link href="/sign-up" className="text-sage-700 hover:text-sage-800 font-medium">
              {t.signUp}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
