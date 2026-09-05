import type { Metadata, Viewport } from "next";
import { Figtree, Noto_Sans } from "next/font/google";
import "./globals.css";
import { ServiceWorker } from "@/components/ServiceWorker";
import { AuthProvider } from "@/context/AuthContext";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const noto = Noto_Sans({
  subsets: ["latin", "devanagari"],
  variable: "--font-noto",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CareConnect Maharashtra",
  description:
    "Rural healthcare referral and continuity platform for Palghar district. Tracks patients from first contact until referral closure.",
  manifest: "/manifest.webmanifest",
  applicationName: "CareConnect MH",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0891b2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} ${noto.variable} antialiased bg-background text-foreground`}>
        <AuthProvider>
          <ServiceWorker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
