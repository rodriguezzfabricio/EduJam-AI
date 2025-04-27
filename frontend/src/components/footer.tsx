import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border py-6 px-4 bg-white dark:bg-black">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <div className="text-blue-600 dark:text-blue-500">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4C9.37 4 4 9.37 4 16C4 22.63 9.37 28 16 28C22.63 28 28 22.63 28 16C28 9.37 22.63 4 16 4ZM16 7C19.86 7 23 10.14 23 14C23 17.86 19.86 21 16 21C12.14 21 9 17.86 9 14C9 10.14 12.14 7 16 7Z" fill="currentColor"/>
            </svg>
          </div>
          <span className="font-bold">MindSync</span>
        </div>
        
        <div className="flex gap-6">
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/courses" className="text-muted-foreground hover:text-foreground transition-colors">
            Courses
          </Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
            Terms
          </Link>
        </div>
        
        <div className="text-sm text-muted-foreground mt-4 md:mt-0">
          © {new Date().getFullYear()} MindSync
        </div>
      </div>
    </footer>
  )
} 