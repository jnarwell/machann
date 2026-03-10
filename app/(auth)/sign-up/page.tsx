"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  kr: {
    title: "Kreye Kont",
    subtitle: "Kòmanse itilize Machann Enfòmasyon",
    name: "Non",
    namePlaceholder: "Non konplè ou",
    email: "Imèl",
    emailPlaceholder: "ou@egzanp.com",
    password: "Modpas",
    passwordHint: "Omwen 6 karaktè",
    phone: "Telefòn (opsyonèl)",
    phonePlaceholder: "+509 1234 5678",
    location: "Kote ou ye (opsyonèl)",
    locationPlaceholder: "Pòtoprens, Ayiti",
    signUp: "Kreye Kont",
    signingUp: "Ap kreye...",
    hasAccount: "Deja gen kont?",
    signIn: "Konekte",
    errorGeneric: "Pa kapab kreye kont. Eseye ankò.",
    errorEmail: "Imèl sa a deja anrejistre",
    errorPhone: "Nimewo telefòn sa a deja anrejistre",
  },
  en: {
    title: "Create Account",
    subtitle: "Start using Machann Enfòmasyon",
    name: "Name",
    namePlaceholder: "Your full name",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    passwordHint: "At least 6 characters",
    phone: "Phone (optional)",
    phonePlaceholder: "+509 1234 5678",
    location: "Location (optional)",
    locationPlaceholder: "Port-au-Prince, Haiti",
    signUp: "Create Account",
    signingUp: "Creating...",
    hasAccount: "Already have an account?",
    signIn: "Sign in",
    errorGeneric: "Could not create account. Please try again.",
    errorEmail: "This email is already registered",
    errorPhone: "This phone number is already registered",
  },
};

export default function SignUpPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || null,
          location: formData.location || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "EMAIL_EXISTS") {
          setError(t.errorEmail);
        } else if (data.code === "PHONE_EXISTS") {
          setError(t.errorPhone);
        } else {
          setError(data.error || t.errorGeneric);
        }
        return;
      }

      // Auto sign-in after successful registration
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but sign-in failed, redirect to sign-in
        router.push("/sign-in");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError(t.errorGeneric);
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
              <label htmlFor="name" className="block text-sm font-medium text-earth-700 mb-1">
                {t.name}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder={t.namePlaceholder}
                required
                className="w-full px-4 py-3 border-2 border-earth-300 bg-white focus:border-sage-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-earth-700 mb-1">
                {t.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
                className="w-full px-4 py-3 border-2 border-earth-300 bg-white focus:border-sage-600 focus:outline-none transition-colors"
              />
              <p className="text-xs text-earth-500 mt-1">{t.passwordHint}</p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-earth-700 mb-1">
                {t.phone}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t.phonePlaceholder}
                className="w-full px-4 py-3 border-2 border-earth-300 bg-white focus:border-sage-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-earth-700 mb-1">
                {t.location}
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder={t.locationPlaceholder}
                className="w-full px-4 py-3 border-2 border-earth-300 bg-white focus:border-sage-600 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sage-700 text-cream-50 py-3 font-medium hover:bg-sage-800 disabled:bg-sage-400 transition-colors"
            >
              {loading ? t.signingUp : t.signUp}
            </button>
          </form>

          <p className="mt-6 text-center text-earth-600">
            {t.hasAccount}{" "}
            <Link href="/sign-in" className="text-sage-700 hover:text-sage-800 font-medium">
              {t.signIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
