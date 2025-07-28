import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingShapes } from "@/components/floating-shapes";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });


export const metadata = {
  title: "Pixora | Free Online AI Image Editor & Photo Enhancer",
  description:
    "Pixora is the best free online AI image editor and photo enhancer. Instantly edit, enhance, upscale, remove backgrounds, and generate images with powerful AI tools. No signup required!",
  keywords: [
    "AI image editor",
    "online photo editor",
    "free image editor",
    "AI photo enhancer",
    "background remover",
    "AI upscaler",
    "image generator",
    "edit images online",
    "remove background online",
    "photo retouching",
    "Pixora",
    "AI art generator",
    "online image enhancer",
    "photo editor web app",
    "best AI image editor",
    "super resolution AI",
    "image colorizer",
    "photo restoration AI",
    "magic erase",
    "AI filters",
    "image to art",
    "neural image editor"
  ],
  openGraph: {
    title: "Pixora | Free Online AI Image Editor & Photo Enhancer",
    description:
      "Edit, enhance, and generate images instantly with Pixora's free online AI image editor. Remove backgrounds, upscale, and apply AI-powered effects in your browser.",
    url: "https://pixora.app/",
    siteName: "Pixora",
    images: [
      {
        url: "/logo-pixora.png",
        width: 512,
        height: 512,
        alt: "Pixora AI Image Editor Logo"
      }
    ],
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    site: "@pixoraapp",
    title: "Pixora | Free Online AI Image Editor & Photo Enhancer",
    description:
      "Edit, enhance, and generate images instantly with Pixora's free online AI image editor. Remove backgrounds, upscale, and apply AI-powered effects in your browser.",
    images: [
      {
        url: "/logo-pixora.png",
        alt: "Pixora AI Image Editor Logo"
      }
    ]
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      maxSnippet: -1,
      maxImagePreview: "large",
      maxVideoPreview: -1
    }
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
      </head>
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            appearance={{
              baseTheme: shadesOfPurple,
            }}
          >
            <ConvexClientProvider>
              <Header />
              <main className="bg-slate-900 min-h-screen text-white overflow-x-hidden">
                <FloatingShapes />
                <Toaster richColors />

                {children}
              </main>
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
