"use client"

import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import RatingDisplay from "@/app/components/rating-display "
import { Mail, MapPin, Calendar, Edit, LogOut, Award, TrendingUp } from "lucide-react"
import { useState } from "react"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "settings">("overview")

  const user = {
    name: "John Smith",
    email: "john@example.com",
    location: "Downtown, San Francisco",
    joinedDate: "January 2023",
    avatar: "👤",
    bio: "Community-minded neighbor who loves sharing tools and helping the neighborhood.",
    lenderRating: 4.8,
    lenderReviews: 24,
    borrowerRating: 4.9,
    borrowerReviews: 18,
    itemsLent: 12,
    itemsBorrowed: 8,
    activeLoans: 2,
    overallReputation: "Excellent",
  }

  const stats = [
    { label: "Items Lent", value: user.itemsLent, icon: "📦" },
    { label: "Items Borrowed", value: user.itemsBorrowed, icon: "📥" },
    { label: "Active Loans", value: user.activeLoans, icon: "⏱" },
    { label: "Reputation", value: user.overallReputation, icon: "⭐" },
  ]

  const activity = [
    { id: "1", type: "borrow_approved", item: "Drill Machine", date: "2 days ago", status: "Approved" },
    { id: "2", type: "item_returned", item: "Pressure Washer", date: "5 days ago", status: "Returned" },
    { id: "3", type: "rating_received", from: "Sarah Johnson", date: "1 week ago", rating: 5 },
    { id: "4", type: "borrow_request", item: "Mountain Bike", date: "2 weeks ago", status: "Pending" },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-2xl border border-border p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-5xl flex-shrink-0">
                {user.avatar}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">{user.name}</h1>
                <p className="text-muted-foreground mb-3">{user.bio}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {user.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {user.joinedDate}
                  </div>
                </div>
              </div>
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover-lift flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-card rounded-xl border border-border p-6 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Lender Rating
              </h3>
              <RatingDisplay rating={user.lenderRating} count={user.lenderReviews} size="lg" />
              <p className="text-sm text-muted-foreground mt-3">
                Lenders rate you on communication, fairness, and item condition matching.
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Borrower Rating
              </h3>
              <RatingDisplay rating={user.borrowerRating} count={user.borrowerReviews} size="lg" />
              <p className="text-sm text-muted-foreground mt-3">
                Borrowers rate you on timely returns, item care, and communication.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-border">
              {["overview", "activity", "settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`flex-1 py-4 px-6 font-semibold transition-smooth border-b-2 ${
                    activeTab === tab
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Profile Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                      <p className="font-semibold text-foreground">{user.name}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Email</p>
                      <p className="font-semibold text-foreground">{user.email}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Location</p>
                      <p className="font-semibold text-foreground">{user.location}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                      <p className="font-semibold text-foreground">{user.joinedDate}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "activity" && (
                <div className="space-y-3">
                  {activity.map((item) => (
                    <div key={item.id} className="p-4 border border-border rounded-lg hover:bg-muted transition-smooth">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {item.type === "borrow_approved" && (
                            <p className="font-semibold text-foreground">
                              Borrow request approved for <span className="text-primary">{item.item}</span>
                            </p>
                          )}
                          {item.type === "item_returned" && (
                            <p className="font-semibold text-foreground">
                              You returned <span className="text-accent">{item.item}</span>
                            </p>
                          )}
                          {item.type === "rating_received" && (
                            <p className="font-semibold text-foreground">
                              <span className="text-secondary">{item.from}</span> gave you a {item.rating}-star review
                            </p>
                          )}
                          {item.type === "borrow_request" && (
                            <p className="font-semibold text-foreground">
                              New borrow request for <span className="text-primary">{item.item}</span>
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">{item.date}</p>
                        </div>
                        {(item as any).status && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              (item as any).status === "Approved"
                                ? "bg-accent/20 text-accent"
                                : (item as any).status === "Returned"
                                  ? "bg-primary/20 text-primary"
                                  : "bg-secondary/20 text-secondary"
                            }`}
                          >
                            {(item as any).status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-semibold text-foreground">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive email updates about requests and returns
                        </p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
                    </label>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-semibold text-foreground">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Get instant notifications on your device</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
                    </label>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-semibold text-foreground">Show Profile Publicly</p>
                        <p className="text-sm text-muted-foreground">Allow other members to see your profile</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
                    </label>
                  </div>
                  <button className="w-full mt-6 py-2 border border-destructive rounded-lg text-destructive hover:bg-destructive/10 transition-smooth font-medium flex items-center justify-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
