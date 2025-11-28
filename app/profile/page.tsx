"use client"

import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import RatingDisplay from "@/app/components/rating-display"
import { Mail, MapPin, Calendar, Edit, LogOut, Award, TrendingUp } from "lucide-react"
import { useState, useMemo } from "react"
import { useProfile, useItems, useBorrowRequests, useRatings } from "@/app/lib/queries"

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`
    return `${Math.floor(diffInSeconds / 2592000)} months ago`
  } catch {
    return "recently"
  }
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "settings">("overview")

  // Fetch real data
  const { data: profile, isLoading: profileLoading } = useProfile()
  const profileId = profile && typeof profile === 'object' ? (profile as any).id : undefined
  const { data: itemsData, isLoading: itemsLoading } = useItems({ owner: profileId })
  const { data: borrowRequestsData, isLoading: borrowRequestsLoading } = useBorrowRequests()
  const { data: ratingsData, isLoading: ratingsLoading } = useRatings()

  // Calculate user data from API responses
  const user = useMemo(() => {
    if (!profile || typeof profile !== 'object') return null

    const profileData = profile as any
    const firstName = profileData.first_name || ""
    const lastName = profileData.last_name || ""
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : profileData.username || "User"
    
    const joinedDate = profileData.date_joined 
      ? new Date(profileData.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : "Recently"

    return {
      name: fullName,
      email: profileData.email || "",
      location: profileData.location || "Not specified",
      joinedDate: joinedDate,
      avatar: profileData.avatar || "👤",
      bio: profileData.bio || "Community-minded neighbor who loves sharing tools and helping the neighborhood.",
    }
  }, [profile])

  // Calculate stats from API data
  const stats = useMemo(() => {
    const profileId = profile && typeof profile === 'object' ? (profile as any).id : null
    
    if (!itemsData || !borrowRequestsData || !profileId) {
      return [
        { label: "Items Lent", value: 0, icon: "📦" },
        { label: "Items Borrowed", value: 0, icon: "📥" },
        { label: "Active Loans", value: 0, icon: "⏱" },
        { label: "Reputation", value: "N/A", icon: "⭐" },
      ]
    }

    const itemsArray = Array.isArray((itemsData as any).results) 
      ? (itemsData as any).results 
      : (Array.isArray(itemsData) ? itemsData : [])
    const itemsLent = itemsArray.length
    
    // Count items borrowed (requests where user is borrower and status is approved/borrowed)
    const requestsArray = Array.isArray((borrowRequestsData as any).results) 
      ? (borrowRequestsData as any).results 
      : (Array.isArray(borrowRequestsData) ? borrowRequestsData : [])
    
    const itemsBorrowed = requestsArray.filter((req: any) => 
      req.borrower === profileId && (req.status === "approved" || req.status === "borrowed")
    ).length

    // Count active loans (requests with status approved/borrowed)
    const activeLoans = requestsArray.filter((req: any) => 
      (req.borrower === profileId || req.item?.owner === profileId) && 
      (req.status === "approved" || req.status === "borrowed")
    ).length

    // Calculate reputation based on ratings
    let reputation = "New"
    if (ratingsData) {
      const ratingsArray = Array.isArray((ratingsData as any).results) 
        ? (ratingsData as any).results 
        : (Array.isArray(ratingsData) ? ratingsData : [])
      const userRatings = ratingsArray.filter((r: any) => r.to_user === profileId)
      if (userRatings.length > 0) {
        const avgRating = userRatings.reduce((sum: number, r: any) => sum + (r.stars || 0), 0) / userRatings.length
        if (avgRating >= 4.5) reputation = "Excellent"
        else if (avgRating >= 4.0) reputation = "Very Good"
        else if (avgRating >= 3.5) reputation = "Good"
        else if (avgRating >= 3.0) reputation = "Fair"
      }
    }

    return [
      { label: "Items Lent", value: itemsLent, icon: "📦" },
      { label: "Items Borrowed", value: itemsBorrowed, icon: "📥" },
      { label: "Active Loans", value: activeLoans, icon: "⏱" },
      { label: "Reputation", value: reputation, icon: "⭐" },
    ]
  }, [itemsData, borrowRequestsData, ratingsData, profile])

  // Calculate ratings
  const ratings = useMemo(() => {
    const profileId = profile && typeof profile === 'object' ? (profile as any).id : null
    
    if (!ratingsData || !profileId) {
      return {
        lenderRating: 0,
        lenderReviews: 0,
        borrowerRating: 0,
        borrowerReviews: 0,
      }
    }

    const ratingsArray = Array.isArray((ratingsData as any).results) 
      ? (ratingsData as any).results 
      : (Array.isArray(ratingsData) ? ratingsData : [])
    
    // Filter ratings where current user is the recipient
    const receivedRatings = ratingsArray.filter((r: any) => r.to_user === profileId)
    
    // Separate lender and borrower ratings (this is a simplification - you may need to adjust based on your API structure)
    // Assuming lender ratings are when user lent items, borrower ratings when user borrowed items
    const lenderRatings = receivedRatings.filter((r: any) => r.rating_type === "lender" || !r.rating_type) // Default to lender if not specified
    const borrowerRatings = receivedRatings.filter((r: any) => r.rating_type === "borrower")

    const lenderRating = lenderRatings.length > 0
      ? lenderRatings.reduce((sum: number, r: any) => sum + (r.stars || 0), 0) / lenderRatings.length
      : 0
    
    const borrowerRating = borrowerRatings.length > 0
      ? borrowerRatings.reduce((sum: number, r: any) => sum + (r.stars || 0), 0) / borrowerRatings.length
      : 0

    return {
      lenderRating: Math.round(lenderRating * 10) / 10,
      lenderReviews: lenderRatings.length,
      borrowerRating: Math.round(borrowerRating * 10) / 10,
      borrowerReviews: borrowerRatings.length,
    }
  }, [ratingsData, profile])

  // Build activity feed from borrow requests and ratings
  const activity = useMemo(() => {
    const activities: any[] = []
    const profileId = profile && typeof profile === 'object' ? (profile as any).id : null

    // Add borrow request activities
    if (borrowRequestsData) {
      const requests = Array.isArray((borrowRequestsData as any).results) 
        ? (borrowRequestsData as any).results 
        : (Array.isArray(borrowRequestsData) ? borrowRequestsData : [])
      
      requests.forEach((req: any) => {
        const date = req.created_at || req.requested_date || new Date().toISOString()
        const itemName = req.item?.title || req.item?.name || "Item"
        
        if (req.status === "approved") {
          activities.push({
            id: `req-${req.id}`,
            type: "borrow_approved",
            item: itemName,
            date: formatRelativeTime(date),
            status: "Approved",
            timestamp: date,
          })
        } else if (req.status === "pending") {
          activities.push({
            id: `req-${req.id}`,
            type: "borrow_request",
            item: itemName,
            date: formatRelativeTime(date),
            status: "Pending",
            timestamp: date,
          })
        }
      })
    }

    // Add rating activities
    if (ratingsData && profileId) {
      const ratingsArray = Array.isArray((ratingsData as any).results) 
        ? (ratingsData as any).results 
        : (Array.isArray(ratingsData) ? ratingsData : [])
      const receivedRatings = ratingsArray.filter((r: any) => r.to_user === profileId)
      
      receivedRatings.forEach((rating: any) => {
        const date = rating.created_at || new Date().toISOString()
        const fromUser = rating.from_user?.username || rating.from_user?.first_name || "Someone"
        
        activities.push({
          id: `rating-${rating.id}`,
          type: "rating_received",
          from: fromUser,
          date: formatRelativeTime(date),
          rating: rating.stars || 0,
          timestamp: date,
        })
      })
    }

    // Sort by timestamp (most recent first)
    return activities.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0).getTime()
      const dateB = new Date(b.timestamp || 0).getTime()
      return dateB - dateA
    }).slice(0, 10) // Limit to 10 most recent
  }, [borrowRequestsData, ratingsData, profile])

  // Loading state
  if (profileLoading || !user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-2xl border border-border p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-5xl flex-shrink-0">
                {typeof user.avatar === 'string' && user.avatar.startsWith('http') ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.avatar
                )}
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
              <RatingDisplay rating={ratings.lenderRating} count={ratings.lenderReviews} size="lg" />
              <p className="text-sm text-muted-foreground mt-3">
                Lenders rate you on communication, fairness, and item condition matching.
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Borrower Rating
              </h3>
              <RatingDisplay rating={ratings.borrowerRating} count={ratings.borrowerReviews} size="lg" />
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
                  {activity.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No activity yet</p>
                  ) : (
                    activity.map((item) => (
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
                          {item.status && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                item.status === "Approved"
                                  ? "bg-accent/20 text-accent"
                                  : item.status === "Returned"
                                    ? "bg-primary/20 text-primary"
                                    : "bg-secondary/20 text-secondary"
                              }`}
                            >
                              {item.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
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
