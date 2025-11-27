"use client"

import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import { Bell, CheckCheck, Trash2, Clock } from "lucide-react"
import { useState } from "react"

interface Notification {
  id: string
  type: "request" | "approved" | "returned" | "rating" | "reminder" | "message"
  title: string
  description: string
  timestamp: string
  read: boolean
  data?: Record<string, any>
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "request",
      title: "New Borrow Request",
      description: "Sarah Johnson wants to borrow your Drill Machine from Jan 15 to Jan 22",
      timestamp: "2 hours ago",
      read: false,
      data: { item: "Drill Machine", requester: "Sarah Johnson" },
    },
    {
      id: "2",
      type: "approved",
      title: "Request Approved",
      description: "Your request to borrow Mountain Bike from Mike Chen has been approved!",
      timestamp: "5 hours ago",
      read: false,
      data: { item: "Mountain Bike", owner: "Mike Chen" },
    },
    {
      id: "3",
      type: "reminder",
      title: "Return Reminder",
      description: "Please return the Pressure Washer tomorrow (Jan 14) to avoid late fees",
      timestamp: "1 day ago",
      read: true,
      data: { item: "Pressure Washer", dueDate: "Jan 14" },
    },
    {
      id: "4",
      type: "rating",
      title: "You Received a Review",
      description: 'Alex Johnson gave you a 5-star review: "Great tools and very communicative!"',
      timestamp: "2 days ago",
      read: true,
      data: { reviewer: "Alex Johnson", rating: 5 },
    },
    {
      id: "5",
      type: "returned",
      title: "Item Returned",
      description: "Robert Wilson has returned your Yoga Mat. Please confirm the condition.",
      timestamp: "3 days ago",
      read: true,
      data: { item: "Yoga Mat", borrower: "Robert Wilson" },
    },
    {
      id: "6",
      type: "message",
      title: "New Message",
      description: 'Emma Davis: "Thanks for lending me the camera! Great quality!"',
      timestamp: "4 days ago",
      read: true,
      data: { sender: "Emma Davis" },
    },
  ])

  const [filter, setFilter] = useState<"all" | "unread">("all")

  const filteredNotifications = filter === "unread" ? notifications.filter((n) => !n.read) : notifications

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
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
                {notifications.filter((n) => !n.read).length} unread notification
                {notifications.filter((n) => !n.read).length !== 1 ? "s" : ""}
              </p>
            </div>
            {notifications.some((n) => !n.read) && (
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
                className={`px-4 py-3 font-semibold border-b-2 transition-smooth ${
                  filter === f
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
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

          {/* Notifications List */}
          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`p-4 rounded-xl border transition-smooth cursor-pointer hover:shadow-md ${
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
