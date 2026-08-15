import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RouteTransition from "@/components/animation/RouteTransition";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SRM Opportunity Intelligence Platform — V2",
    template: "%s | SRM Opportunity Intelligence",
  },
  description:
    "AI-powered Opportunity Intelligence Platform for SRM Institute of Science and Technology. Discover hackathons, internships, research grants, and verified club recruitments tailored to your skill vectors.",
  keywords: [
    "SRM Institute of Science and Technology",
    "SRM Opportunities",
    "SRM Hackathons",
    "SRM Clubs",
    "SRM Internships",
    "Campus Opportunity Intelligence",
  ],
  authors: [{ name: "SRM Opportunity Intelligence Platform Team" }],
  openGraph: {
    title: "SRM Opportunity Intelligence Platform",
    description:
      "Stop searching scattered WhatsApp groups. Discover opportunities that actually matter to your academic & career vector.",
    url: "https://srm-opportunities.vercel.app",
    siteName: "SRM Opportunity Intelligence",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SRM Opportunity Intelligence Platform",
    description:
      "AI-powered campus opportunity discovery & verified organization network for SRM students.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="bg-zinc-950 text-zinc-100 antialiased font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <div className="relative min-h-screen overflow-x-hidden">
          {/* Ambient Floating Gradient Lights */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
          <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-purple-900/5 blur-[120px] pointer-events-none" />
          
          <RouteTransition>{children}</RouteTransition>
        </div>
      </body>
    </html>
  );
}
