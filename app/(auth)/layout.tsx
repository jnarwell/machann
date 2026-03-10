import { LanguageProvider } from "@/contexts/LanguageContext";
import SessionProvider from "@/components/providers/SessionProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <main className="noise-bg">{children}</main>
      </LanguageProvider>
    </SessionProvider>
  );
}
