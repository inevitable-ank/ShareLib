"use client"

import Link from "next/link"
import { Bell, User, Search, Menu, X } from "lucide-react"
import { useState } from "react"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white">
              📚
            </div>
            <span>ShareLib</span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search items..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/browse" className="px-3 py-2 rounded-lg hover:bg-muted transition-smooth">
              Browse
            </Link>
            <Link href="/my-items" className="px-3 py-2 rounded-lg hover:bg-muted transition-smooth">
              My Items
            </Link>
            <Link href="/requests" className="px-3 py-2 rounded-lg hover:bg-muted transition-smooth">
              Requests
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-smooth">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-smooth">
              <User className="w-5 h-5" />
            </button>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-smooth"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-2">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search items..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Link href="/browse" className="px-3 py-2 rounded-lg hover:bg-muted transition-smooth">
              Browse
            </Link>
            <Link href="/my-items" className="px-3 py-2 rounded-lg hover:bg-muted transition-smooth">
              My Items
            </Link>
            <Link href="/requests" className="px-3 py-2 rounded-lg hover:bg-muted transition-smooth">
              Requests
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
