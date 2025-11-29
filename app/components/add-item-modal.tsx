"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Upload, MapPin, Loader2 } from "lucide-react"
import { useCreateItem, useCategories } from "@/app/lib/queries"

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [condition, setCondition] = useState("good")
  const [location, setLocation] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [maxBorrowDuration, setMaxBorrowDuration] = useState("14")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const createItemMutation = useCreateItem()
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories()

  useEffect(() => {
    if (createItemMutation.isSuccess) {
      // Reset form
      setTitle("")
      setDescription("")
      setCategory("")
      setCondition("good")
      setLocation("")
      setLatitude("")
      setLongitude("")
      setMaxBorrowDuration("14")
      setImages([])
      setImagePreviews([])
      onClose()
    }
  }, [createItemMutation.isSuccess, onClose])

  // Get categories list
  const categories = Array.isArray(categoriesData) ? categoriesData : []

  if (!isOpen) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(file.type)
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
      return isValidType && isValidSize
    })

    if (validFiles.length !== files.length) {
      alert("Some files were rejected. Only JPEG, PNG, WebP images under 5MB are allowed.")
    }

    setImages((prev) => [...prev, ...validFiles])

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description || !category || !location || images.length === 0) {
      return
    }

    // Create FormData
    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("category", category)
    formData.append("condition", condition)
    formData.append("location", location)
    if (latitude) formData.append("latitude", latitude)
    if (longitude) formData.append("longitude", longitude)
    formData.append("max_borrow_duration_days", maxBorrowDuration)

    // Append all images
    images.forEach((image) => {
      formData.append("images", image)
    })

    createItemMutation.mutate(formData)
  }

  const error =
    !title || !description || !category || !location || images.length === 0
      ? "Please fill in all required fields and add at least one image"
      : createItemMutation.error instanceof Error
        ? createItemMutation.error.message
        : null
  const isSubmitting = createItemMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-xl font-bold text-foreground">Add New Item</h2>
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

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Professional Drill Machine"
              className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item in detail..."
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth resize-none"
              required
            />
          </div>

          {/* Category and Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category <span className="text-destructive">*</span>
              </label>
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Condition <span className="text-destructive">*</span>
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                required
              >
                <option value="new">New</option>
                <option value="good">Good</option>
                <option value="used">Used</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Location <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., San Francisco, CA"
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                required
              />
            </div>
          </div>

          {/* Latitude and Longitude (Optional) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Latitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="37.7749"
                className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Longitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-122.4194"
                className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
              />
            </div>
          </div>

          {/* Max Borrow Duration */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Max Borrow Duration (Days)
            </label>
            <input
              type="number"
              min="1"
              value={maxBorrowDuration}
              onChange={(e) => setMaxBorrowDuration(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Images <span className="text-destructive">*</span>
            </label>
            <div className="space-y-4">
              {/* Image Upload Input */}
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-smooth">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload images (JPEG, PNG, WebP - Max 5MB each)
                  </span>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-accent/10 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Your item will be visible to the community once submitted. Make sure all information is accurate.
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
              disabled={isSubmitting || !title || !description || !category || !location || images.length === 0}
              className="flex-1 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg hover-lift disabled:opacity-50 font-medium"
            >
              {isSubmitting ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

