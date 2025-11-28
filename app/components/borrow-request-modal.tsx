"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Calendar, MessageSquare, X } from "lucide-react"
import { useCreateBorrowRequest } from "@/app/lib/queries"

interface BorrowRequestModalProps {
  isOpen: boolean
  onClose: () => void
  itemTitle: string
  itemId: string
}

export default function BorrowRequestModal({ isOpen, onClose, itemTitle, itemId }: BorrowRequestModalProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [message, setMessage] = useState("")
  const createRequestMutation = useCreateBorrowRequest()

  useEffect(() => {
    if (createRequestMutation.isSuccess) {
      setStartDate("")
      setEndDate("")
      setMessage("")
      onClose()
    }
  }, [createRequestMutation.isSuccess, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!startDate || !endDate) {
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      return
    }

    // Convert dates to ISO format
    const startDateISO = new Date(startDate).toISOString()
    const endDateISO = new Date(endDate).toISOString()

    createRequestMutation.mutate({
      item_id: parseInt(itemId),
      message: message || undefined,
      start_date: startDateISO,
      end_date: endDateISO,
    })
  }

  const error =
    !startDate || !endDate
      ? "Please select both start and end dates"
      : new Date(endDate) < new Date(startDate)
        ? "End date must be after start date"
        : createRequestMutation.error instanceof Error
          ? createRequestMutation.error.message
          : null
  const isSubmitting = createRequestMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-xl font-bold text-foreground">Request to Borrow</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-smooth">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Item Title */}
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Requesting to borrow</p>
            <p className="font-semibold text-foreground">{itemTitle}</p>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                required
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Return Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                required
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Message to Owner (Optional)</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the owner why you need this item..."
                rows={4}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth resize-none"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-accent/10 rounded-lg">
            <p className="text-sm text-muted-foreground">
              The owner will review your request and notify you within 24 hours.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-border rounded-lg hover:bg-muted transition-smooth font-medium text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !startDate || !endDate}
              className="flex-1 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg hover-lift disabled:opacity-50 font-medium"
            >
              {isSubmitting ? "Submitting..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
