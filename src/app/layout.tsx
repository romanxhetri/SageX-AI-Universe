import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SageX AI Universe - 3D E-commerce Experience",
  description: "Immersive 3D solar system e-commerce platform with AI-powered features. Browse mobile, laptop, fashion, and more in a stunning virtual universe.",
  keywords: ["SageX", "3D Shopping", "E-commerce", "Three.js", "AI", "Virtual Universe", "React"],
  authors: [{ name: "SageX Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "SageX AI Universe",
    description: "Immersive 3D e-commerce experience powered by AI",
    url: "https://sagex.ai",
    siteName: "SageX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SageX AI Universe",
    description: "Immersive 3D e-commerce experience powered by AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
