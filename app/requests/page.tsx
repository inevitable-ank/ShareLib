"use client"

import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import { CheckCircle, XCircle, Clock, Calendar, User } from "lucide-react"
import { useState } from "react"

interface BorrowRequest {
  id: string
  item: string
  requester: string
  requesterRating: number
  startDate: string
  endDate: string
  status: "pending" | "approved" | "rejected"
  message?: string
  requestedDate: string
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<BorrowRequest[]>([
    {
      id: "1",
      item: "Drill Machine",
      requester: "Sarah Johnson",
      requesterRating: 4.7,
      startDate: "Jan 15, 2025",
      endDate: "Jan 22, 2025",
      status: "pending",
      message: "I need this for a home improvement project. Will take great care of it!",
      requestedDate: "2 hours ago",
    },
    {
      id: "2",
      item: "Pressure Washer",
      requester: "Mike Chen",
      requesterRating: 4.9,
      startDate: "Jan 20, 2025",
      endDate: "Jan 25, 2025",
      status: "approved",
      requestedDate: "1 day ago",
    },
    {
      id: "3",
      item: "Mountain Bike",
      requester: "Emma Davis",
      requesterRating: 4.6,
      startDate: "Jan 10, 2025",
      endDate: "Jan 17, 2025",
      status: "rejected",
      requestedDate: "3 days ago",
    },
    {
      id: "4",
      item: "Camera",
      requester: "John Lee",
      requesterRating: 4.8,
      startDate: "Jan 25, 2025",
      endDate: "Feb 1, 2025",
      status: "pending",
      message: "Looking for a camera for a weekend trip. Thanks!",
      requestedDate: "5 hours ago",
    },
  ])

  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "all">("all")

  const filteredRequests = activeTab === "all" ? requests : requests.filter((r) => r.status === activeTab)

  const handleApprove = (id: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "approved" } : r)))
  }

  const handleReject = (id: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)))
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-secondary/20 text-secondary",
      approved: "bg-accent/20 text-accent",
      rejected: "bg-destructive/20 text-destructive",
    }
    return colors[status as keyof typeof colors]
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
    }
    return icons[status as keyof typeof icons] || Clock
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Borrow Requests</h1>
            <p className="text-muted-foreground">Manage requests from people who want to borrow your items</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 my-8">
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-2xl font-bold text-secondary">
                {requests.filter((r) => r.status === "pending").length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Pending</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-2xl font-bold text-accent">
                {requests.filter((r) => r.status === "approved").length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Approved</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-2xl font-bold text-destructive">
                {requests.filter((r) => r.status === "rejected").length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Rejected</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border">
            {["all", "pending", "approved"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-4 py-3 font-semibold border-b-2 transition-smooth ${
                  activeTab === tab
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Requests List */}
          {filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const StatusIcon = getStatusIcon(request.status)
                return (
                  <div
                    key={request.id}
                    className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-smooth"
                  >
                    <div className="flex items-start gap-6">
                      {/* Status Badge */}
                      <div className={`p-3 rounded-lg flex-shrink-0 ${getStatusColor(request.status)}`}>
                        <StatusIcon className="w-6 h-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-foreground">
                              {request.requester} wants to borrow <span className="text-primary">{request.item}</span>
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">Requested {request.requestedDate}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(request.status)}`}
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>

                        {/* Requester Info */}
                        <div className="flex items-center gap-2 mb-4 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{request.requester}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">⭐ {request.requesterRating}</span>
                        </div>

                        {/* Dates */}
                        <div className="flex flex-wrap gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {request.startDate} to {request.endDate}
                            </span>
                          </div>
                        </div>

                        {/* Message */}
                        {request.message && (
                          <div className="p-3 bg-muted rounded-lg mb-4 text-sm">
                            <p className="font-medium text-foreground mb-1">Message from requester:</p>
                            <p className="text-muted-foreground italic">{request.message}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {request.status === "pending" && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover-lift font-medium flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 font-medium flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Clock className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No requests</h3>
              <p className="text-muted-foreground">You don't have any borrow requests at the moment</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
