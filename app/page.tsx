"use client"

import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import ItemCard from "@/app/components/item-card"
import { ArrowRight, Users, Leaf, Heart, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/app/lib/queries"

const featuredItems = [
  {
    id: "1",
    title: "Drill Machine - Professional Grade",
    category: "Tools",
    image: "/drill-machine.png",
    condition: "Good" as const,
    ownerName: "John Smith",
    ownerRating: 4.8,
    location: "Downtown",
    distance: "2.3 km",
  },
  {
    id: "2",
    title: "Mountain Bike XC Edition",
    category: "Sports Equipment",
    image: "/mountain-bike-trail.png",
    condition: "New" as const,
    ownerName: "Sarah Johnson",
    ownerRating: 4.9,
    location: "Riverside",
    distance: "4.1 km",
  },
  {
    id: "3",
    title: "Canon DSLR Camera Bundle",
    category: "Electronics",
    image: "/vintage-camera-still-life.png",
    condition: "Good" as const,
    ownerName: "Mike Chen",
    ownerRating: 4.7,
    location: "Midtown",
    distance: "1.8 km",
  },
  {
    id: "4",
    title: "Air Fryer Pro Max",
    category: "Appliances",
    image: "/air-fryer-kitchen.jpg",
    condition: "New" as const,
    ownerName: "James Brown",
    ownerRating: 4.7,
    location: "Westside",
    distance: "3.8 km",
  },
]

export default function HomePage() {
  const isAuthenticated = useAuth()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <h1 className="text-5xl md:text-6xl font-bold text-balance mb-6">
                  Share, Borrow, Build{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
                    Community
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground text-balance mb-8">
                  Connect with neighbors to share items, reduce waste, and build lasting relationships. Access the
                  tools, books, and gadgets you need without the cost.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/browse"
                    className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-lg hover-lift flex items-center justify-center gap-2"
                  >
                    Start Browsing
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  {!isAuthenticated && (
                    <Link
                      href="/register"
                      className="px-8 py-4 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary/10 transition-smooth flex items-center justify-center gap-2"
                    >
                      Create Account
                    </Link>
                  )}
                </div>
              </div>

              {/* Right - Image */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 border border-primary/30">
                  <div className="aspect-square bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-9xl">
                    🤝
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-card border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose ShareLib?</h2>
              <p className="text-xl text-muted-foreground">Everything you need to share and connect</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Users,
                  title: "Build Trust",
                  description: "Ratings and reviews ensure a safe, trustworthy community",
                },
                {
                  icon: Leaf,
                  title: "Reduce Waste",
                  description: "Share resources to minimize unnecessary consumption",
                },
                {
                  icon: Heart,
                  title: "Save Money",
                  description: "Access items for free or low cost from neighbors",
                },
                {
                  icon: TrendingUp,
                  title: "Grow Together",
                  description: "Strengthen community bonds and local connections",
                },
              ].map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-xl border border-border hover:border-primary transition-smooth hover:shadow-lg"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Featured Items */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-2">Featured Items</h2>
                <p className="text-muted-foreground">Check out what's available in your community</p>
              </div>
              <Link href="/browse" className="text-primary font-semibold hover:underline flex items-center gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item) => (
                <ItemCard key={item.id} {...item} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4">Ready to Join?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Become part of a community that shares, trusts, and grows together
            </p>
            {!isAuthenticated && (
              <Link
                href="/register"
                className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-lg hover-lift flex items-center gap-2"
              >
                Get Started Today
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
