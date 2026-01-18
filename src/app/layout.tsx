import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { ConfirmProvider } from "@/lib/confirm";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PIK-R Content Creator",
  description: "Create stunning content for your social media with AI-powered captions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="antialiased">
        <ThemeProvider>
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
