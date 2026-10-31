import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BrightloopProvider } from "@/context/brightloop-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Brightloop — Subscription Management (Frappe + Next.js + shadcn UI)",
  description: "Enterprise Subscription Management Platform with Extracted Frappe Core Logics and shadcn UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BrightloopProvider>
          {children}
        </BrightloopProvider>
      </body>
    </html>
  );
}

