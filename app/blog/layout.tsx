import { Newsreader } from "next/font/google"
import Link from "next/link"
import type { ReactNode } from "react"
import "./blog.css"

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-blog-display",
  display: "swap",
})

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`blog-shell min-h-screen ${newsreader.variable}`}>
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0f0e1c]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[720px] items-center justify-between px-5 py-3.5 md:max-w-[780px]">
          <Link
            href="/"
            className="text-sm font-medium tracking-wide text-white/70 transition hover:text-white"
          >
            Home
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link
              href="/blog"
              className="text-violet-300/90 transition hover:text-violet-200"
            >
              Blog
            </Link>
            <Link
              href="/#contact"
              className="text-white/45 transition hover:text-white/80"
            >
              Contact
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[720px] px-5 py-12 md:max-w-[780px] md:py-16">
        {children}
      </main>
    </div>
  )
}
