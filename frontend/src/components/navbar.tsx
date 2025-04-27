"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  return (
    <header className="border-b border-border bg-white dark:bg-black py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-blue-600 dark:text-blue-500">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4C9.37 4 4 9.37 4 16C4 22.63 9.37 28 16 28C22.63 28 28 22.63 28 16C28 9.37 22.63 4 16 4ZM16 7C19.86 7 23 10.14 23 14C23 17.86 19.86 21 16 21C12.14 21 9 17.86 9 14C9 10.14 12.14 7 16 7Z" fill="currentColor"/>
            </svg>
          </div>
          <Link href="/" className="text-2xl font-bold">
            MindSync
          </Link>
          <span className="text-sm text-muted-foreground hidden md:inline-block">Interactive Whiteboard</span>
        </div>
        <nav className="flex gap-6 font-medium items-center">
          <Link href="/whiteboard" className="hover:text-primary transition-colors uppercase">
            Whiteboard
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors uppercase">
            About
          </Link>
          <Link href="/help" className="hover:text-primary transition-colors uppercase">
            Help
          </Link>
          <div className="hidden md:flex items-center px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            Realtime
          </div>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
} 