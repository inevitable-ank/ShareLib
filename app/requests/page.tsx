"use client"

import Header from "@/app/components/header"
import Footer from "@/app/components/footer"
import { CheckCircle, XCircle, Clock, Calendar, User, Loader2 } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { useBorrowRequests, useUpdateBorrowRequest } from "@/app/lib/queries"
import { useRouter } from "next/navigation"

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

// Helper function to format date
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateString
  }
}

export default function RequestsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "all">("all")
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Fetch borrow requests where current user is the lender (owner of the item)
  const { data: borrowRequestsData, isLoading, error } = useBorrowRequests({ lender: 'me' })
  
  // Mutation for updating request status
  const updateRequestMutation = useUpdateBorrowRequest()

  // Redirect to login if session expired
  useEffect(() => {
    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('Session expired') || errorMessage.includes('token') || errorMessage.includes('401')) {
        const timer = setTimeout(() => {
          router.push('/login')
        }, 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [error, router])

  // Transform backend data to frontend format
  const requests = useMemo<BorrowRequest[]>(() => {
    if (!borrowRequestsData) return []

    // Handle both array and paginated response formats
    const requestsArray = Array.isArray(borrowRequestsData)
      ? borrowRequestsData
      : (borrowRequestsData as any)?.results || []

    return requestsArray.map((req: any) => {
      // Extract item title - backend provides item object with title
      const itemTitle = req.item?.title || req.item?.name || "Item"
      
      // Extract requester (borrower) information
      // Backend provides both 'requester' (alias) and 'borrower' fields
      const requester = req.requester || req.borrower
      
      // Backend now provides full_name field (computed from first_name + last_name)
      // Fallback to constructing from first_name/last_name, then username
      const requesterName = requester?.full_name 
        || (requester?.first_name && requester?.last_name 
          ? `${requester.first_name} ${requester.last_name}`.trim()
          : requester?.first_name || requester?.last_name
          ? `${requester.first_name || ''} ${requester.last_name || ''}`.trim()
          : requester?.username || "Unknown User")
      
      // Extract requester rating
      // Backend provides context-aware 'rating' field (shows borrower_rating when viewing as lender)
      // Also has borrower_rating and lender_rating as fallbacks
      let requesterRating = 0
      if (requester?.rating !== undefined && requester?.rating !== null) {
        requesterRating = typeof requester.rating === 'string' 
          ? parseFloat(requester.rating) || 0
          : Number(requester.rating) || 0
      } else if (requester?.borrower_rating !== undefined && requester?.borrower_rating !== null) {
        requesterRating = typeof requester.borrower_rating === 'string'
          ? parseFloat(requester.borrower_rating) || 0
          : Number(requester.borrower_rating) || 0
      }

      // Format dates - backend provides start_date and end_date as date strings
      const startDate = req.start_date ? formatDate(req.start_date) : "Not specified"
      const endDate = req.end_date ? formatDate(req.end_date) : "Not specified"
      
      // Format requested date (relative time)
      // Backend provides requested_at and created_at aliases for request_date
      const requestedDate = req.requested_at 
        ? formatRelativeTime(req.requested_at)
        : req.created_at 
        ? formatRelativeTime(req.created_at)
        : req.request_date
        ? formatRelativeTime(req.request_date)
        : "recently"

      // Map backend status to frontend status
      // Backend status choices: pending, approved, rejected, cancelled, completed, returned
      let status: "pending" | "approved" | "rejected" = "pending"
      if (req.status === "approved" || req.status === "completed" || req.status === "returned") {
        // Approved, completed, and returned requests are shown as "approved"
        status = "approved"
      } else if (req.status === "rejected" || req.status === "cancelled") {
        // Rejected and cancelled requests are shown as "rejected"
        status = "rejected"
      } else {
        // Default to pending for any other status
        status = "pending"
      }

      return {
        id: String(req.id),
        item: itemTitle,
        requester: requesterName,
        requesterRating: requesterRating,
        startDate: startDate,
        endDate: endDate,
        status: status,
        message: req.message || undefined,
        requestedDate: requestedDate,
      }
    })
  }, [borrowRequestsData])

  const filteredRequests = activeTab === "all" 
    ? requests 
    : requests.filter((r) => r.status === activeTab)

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      await updateRequestMutation.mutateAsync({
        id: id,
        data: { status: "approved" }
      })
      // Success - data will automatically refresh via query invalidation
    } catch (error) {
      console.error("Failed to approve request:", error)
      // Error is handled by the mutation and will be shown in the error state
      // The mutation automatically invalidates queries, so UI will update
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: string) => {
    setProcessingId(id)
    try {
      await updateRequestMutation.mutateAsync({
        id: id,
        data: { status: "rejected" }
      })
      // Success - data will automatically refresh via query invalidation
    } catch (error) {
      console.error("Failed to reject request:", error)
      // Error is handled by the mutation and will be shown in the error state
      // The mutation automatically invalidates queries, so UI will update
    } finally {
      setProcessingId(null)
    }
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

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4 my-8">
              <p className="text-destructive">
                {error instanceof Error ? error.message : "Failed to load borrow requests. Please try again."}
              </p>
            </div>
          )}

          {/* Stats */}
          {!isLoading && (
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
          )}

          {/* Filter Tabs */}
          {!isLoading && (
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
          )}

          {/* Requests List */}
          {!isLoading && filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const StatusIcon = getStatusIcon(request.status)
                const isProcessing = processingId === request.id
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
                          {request.requesterRating > 0 && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">⭐ {request.requesterRating.toFixed(1)}</span>
                            </>
                          )}
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
                            disabled={isProcessing || updateRequestMutation.isPending}
                            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover-lift font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={isProcessing || updateRequestMutation.isPending}
                            className="px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : !isLoading ? (
            <div className="text-center py-16">
              <Clock className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No requests</h3>
              <p className="text-muted-foreground">You don't have any borrow requests at the moment</p>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  )
}
