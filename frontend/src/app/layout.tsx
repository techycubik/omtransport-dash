import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import { Inter } from "next/font/google";

// Load Inter font (primary)
const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "OM Transport Dashboard",
  description:
    "Transportation management dashboard for OM Transport operations",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} light`} data-theme="light">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                border: "1px solid rgb(var(--border))",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgb(var(--card))",
                color: "rgb(var(--card-foreground))",
                fontSize: "var(--font-size-sm)",
                fontFamily: "var(--font-primary)",
                boxShadow: "var(--shadow-md)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
