import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PwaRegister } from "@/components/providers/pwa-register";
import { PwaInstallPrompt } from "@/components/providers/pwa-install-prompt";
import { Toaster } from "sonner";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "منصة الچوو التعليمية | يوسف أسامة",
    template: "%s | منصة الچوو التعليمية",
  },
  description: "منصة تعليمية خاصة للدراسة وتنظيم المحاضرات والأقسام الأكاديمية بإشراف يوسف أسامة",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "منصة الچوو",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning className={cairo.variable}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-primary-foreground relative bg-mesh">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster
            position="top-center"
            dir="rtl"
            richColors
            closeButton
            toastOptions={{
              className: "font-sans text-sm rounded-2xl",
            }}
          />
          <PwaRegister />
          <PwaInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
