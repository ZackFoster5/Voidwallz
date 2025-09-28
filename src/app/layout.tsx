import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Voidwallz - Modern Wallpaper Collection",
  description: "Discover and download high-quality wallpapers with a brutalist design aesthetic. Features curated collections across multiple categories.",
  keywords: "wallpapers, backgrounds, desktop, mobile, high resolution, brutalist design",
  authors: [{ name: "Voidwallz" }],
  creator: "Voidwallz",
  publisher: "Voidwallz",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://voidwallz.com",
    title: "Voidwallz - Modern Wallpaper Collection",
    description: "Discover and download high-quality wallpapers with a brutalist design aesthetic.",
    siteName: "Voidwallz",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voidwallz - Modern Wallpaper Collection",
    description: "Discover and download high-quality wallpapers with a brutalist design aesthetic.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${spaceMono.variable} antialiased`}>
        <ThemeProvider defaultTheme="dark">
          <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
