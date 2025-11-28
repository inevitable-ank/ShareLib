"use client"

import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import { Bell, CheckCheck, Trash2, Clock, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { notificationsAPI } from "@/app/lib/api"

interface Notification {
  id: string
  type: "request" | "approved" | "returned" | "rating" | "reminder" | "message"
  title: string
  description: string
  timestamp: string
  read: boolean
  data?: Record<string, any>
}

// Backend notification response type
interface BackendNotification {
  id: number
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  related_item?: any
  related_request?: any
  metadata?: Record<string, any>
}

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? "day" : "days"} ago`
    }
    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800)
      return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
    }
    const months = Math.floor(diffInSeconds / 2592000)
    return `${months} ${months === 1 ? "month" : "months"} ago`
  } catch {
    return "recently"
  }
}

// Map backend notification type to frontend type
function mapNotificationType(backendType: string): "request" | "approved" | "returned" | "rating" | "reminder" | "message" {
  const typeMap: Record<string, "request" | "approved" | "returned" | "rating" | "reminder" | "message"> = {
    request: "request",
    approved: "approved",
    rejected: "approved", // Treat rejected as approved type for display (same styling)
    returned: "returned",
    rating: "rating",
    reminder: "reminder",
    message: "message",
    item_available: "request", // Map item_available to request type
  }
  return typeMap[backendType] || "request"
}

// Convert backend notification to frontend format
function convertNotification(backendNotif: BackendNotification): Notification {
  return {
    id: backendNotif.id.toString(),
    type: mapNotificationType(backendNotif.type),
    title: backendNotif.title,
    description: backendNotif.message,
    timestamp: formatRelativeTime(backendNotif.created_at),
    read: backendNotif.is_read,
    data: backendNotif.metadata || {},
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all notifications (we filter on frontend to maintain accurate counts)
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await notificationsAPI.getNotifications({
        filter: "all",
      })
      
      // Handle paginated response - backend returns {count, unread_count, results}
      const paginatedResponse = response as any
      const backendNotifications: BackendNotification[] = 
        Array.isArray(response) 
          ? response 
          : paginatedResponse.results || []
      
      const convertedNotifications = backendNotifications.map(convertNotification)
      setNotifications(convertedNotifications)
      
      // Note: unread_count is available in paginatedResponse.unread_count if needed
    } catch (err) {
      console.error("Error fetching notifications:", err)
      setError(err instanceof Error ? err.message : "Failed to load notifications")
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    
    // Refresh notifications when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Filter notifications based on selected tab
  const filteredNotifications = filter === "unread" ? notifications.filter((n) => !n.read) : notifications

  const markAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id)
      // Optimistically update UI
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (err) {
      console.error("Error marking notification as read:", err)
      // Refresh on error
      fetchNotifications()
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead()
      // Optimistically update UI
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
    } catch (err) {
      console.error("Error marking all as read:", err)
      // Refresh on error
      fetchNotifications()
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await notificationsAPI.deleteNotification(id)
      // Optimistically update UI
      setNotifications(notifications.filter((n) => n.id !== id))
    } catch (err) {
      console.error("Error deleting notification:", err)
      // Refresh on error
      fetchNotifications()
    }
  }

  const getNotificationIcon = (type: string) => {
    const icons = {
      request: "📋",
      approved: "✅",
      returned: "📦",
      rating: "⭐",
      reminder: "⏰",
      message: "💬",
    }
    return icons[type as keyof typeof icons] || "📢"
  }

  const getNotificationColor = (type: string) => {
    const colors = {
      request: "bg-primary/10 border-primary/30 text-primary",
      approved: "bg-accent/10 border-accent/30 text-accent",
      returned: "bg-secondary/10 border-secondary/30 text-secondary",
      rating: "bg-secondary/10 border-secondary/30 text-secondary",
      reminder: "bg-destructive/10 border-destructive/30 text-destructive",
      message: "bg-primary/10 border-primary/30 text-primary",
    }
    return colors[type as keyof typeof colors] || "bg-muted border-border"
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Bell className="w-8 h-8" />
                Notifications
              </h1>
              <p className="text-muted-foreground">
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    {notifications.filter((n) => !n.read).length} unread notification
                    {notifications.filter((n) => !n.read).length !== 1 ? "s" : ""}
                  </>
                )}
              </p>
            </div>
            {!loading && notifications.some((n) => !n.read) && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover-lift flex items-center gap-2 font-medium"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All as Read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border">
            {["all", "unread"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as typeof filter)}
                disabled={loading}
                className={`px-4 py-3 font-semibold border-b-2 transition-smooth ${
                  filter === f
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === "unread" && notifications.filter((n) => !n.read).length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Loading notifications...</h3>
              <p className="text-muted-foreground">Please wait while we fetch your notifications</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <Bell className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Error loading notifications</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button
                onClick={fetchNotifications}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover-lift"
              >
                Try Again
              </button>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={`p-4 rounded-xl border transition-smooth ${
                    !notification.read ? "cursor-pointer hover:shadow-md" : ""
                  } ${
                    notification.read ? "bg-card border-border" : "bg-primary/5 border-primary/20"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-lg flex-shrink-0 text-2xl ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${notification.read ? "text-foreground" : "text-foreground"}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notification.timestamp}
                        </div>
                        {!notification.read && (
                          <span className="px-2 py-1 bg-primary/20 text-primary rounded-full">New</span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="p-2 rounded-lg hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Bell className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {filter === "unread"
                  ? "All caught up!"
                  : "You'll get notified about requests, returns, and messages here"}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

