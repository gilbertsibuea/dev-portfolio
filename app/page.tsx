import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights} from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { generateMetadata, siteConfig } from '@/lib/metadata';
import dynamic from 'next/dynamic';

// Lazy load non-critical components
const Stack = dynamic(() => import("@/components/Stack").then(mod => ({ default: mod.Stack })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200" />
});

const Experience = dynamic(() => import("@/components/Experience").then(mod => ({ default: mod.Experience })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200" />
});

const LogoAnimation = dynamic(() => import("@/components/LogoAnimation").then(mod => ({ default: mod.LogoAnimation })), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200" />
});

const Portfolio = dynamic(() => import("@/components/Portfolio").then(mod => ({ default: mod.Portfolio })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200" />
});

const KeyMetrics = dynamic(() => import("@/components/KeyMetrics").then(mod => ({ default: mod.KeyMetrics })), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200" />
});

const Services = dynamic(() => import("@/components/Services").then(mod => ({ default: mod.Services })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-200" />
});

const Contact = dynamic(() => import("@/components/Contact").then(mod => ({ default: mod.Contact })), {
  loading: () => <div className="h-64 animate-pulse bg-gray-200" />
});

const Footer = dynamic(() => import("@/components/Footer").then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="h-32 animate-pulse bg-gray-200" />
});

export const metadata: Metadata = generateMetadata({
  title: "Gilbert Sibuea - Full Stack Developer Portfolio",
  description: `Gilbert Hasiholan Sibuea — Full Stack Developer based in Bandar Lampung, Indonesia. Explore innovative web applications, mobile solutions, and software projects built with React, Next.js, Node.js, and more. Available for freelance projects and full-time opportunities. Visit gilbertsibuea.com.`,
  url: siteConfig.url,
});

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stack />
      <Experience />
      <LogoAnimation/>
      <Portfolio/>
      <KeyMetrics/>
      <Services/>
      <Contact/>
      <Footer/>
      <Analytics />
      <SpeedInsights/>
    </>
  );
}
