"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"

export function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2">
          <div className="text-blue-600 dark:text-blue-500">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4C9.37 4 4 9.37 4 16C4 22.63 9.37 28 16 28C22.63 28 28 22.63 28 16C28 9.37 22.63 4 16 4ZM16 7C19.86 7 23 10.14 23 14C23 17.86 19.86 21 16 21C12.14 21 9 17.86 9 14C9 10.14 12.14 7 16 7Z" fill="currentColor"/>
            </svg>
          </div>
          <Link href="/" className="font-bold text-xl mr-8">
            MindSync
          </Link>
          <span className="text-sm text-muted-foreground hidden md:inline-block">Interactive Whiteboard</span>
          {user && (
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link
                href="/dashboard"
                className={`transition-colors hover:text-foreground/80 ${
                  isActive("/dashboard")
                    ? "text-foreground font-medium"
                    : "text-foreground/60"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/study-groups"
                className={`transition-colors hover:text-foreground/80 ${
                  isActive("/study-groups")
                    ? "text-foreground font-medium"
                    : "text-foreground/60"
                }`}
              >
                Study Groups
              </Link>
              <Link
                href="/ai-chat"
                className={`transition-colors hover:text-foreground/80 ${
                  isActive("/ai-chat")
                    ? "text-foreground font-medium"
                    : "text-foreground/60"
                }`}
              >
                AI Chat
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center ml-auto gap-2">
          <ModeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-medium">{user.email}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 