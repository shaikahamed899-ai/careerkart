import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerKart - Your Job. Our Guidance.",
  description:
    "Your AI Recruiters Are Ready To Help You Land The Right Job. Chat with Donna and Harvey to discover smart job matches, get interview-ready, practice questions, improve your resume, or ask for career advice.",
  keywords: [
    "job search",
    "career",
    "AI recruiter",
    "resume",
    "job matching",
    "interview preparation",
  ],
  authors: [{ name: "CareerKart" }],
  openGraph: {
    title: "CareerKart - Your Job. Our Guidance.",
    description:
      "Your AI Recruiters Are Ready To Help You Land The Right Job.",
    type: "website",
    locale: "en_US",
    siteName: "CareerKart",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-grey-950 text-grey-900 dark:text-grey-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
