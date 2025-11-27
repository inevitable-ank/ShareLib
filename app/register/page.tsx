"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { Mail, Lock, User, MapPin, ArrowRight } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    agreeTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match")
      return
    }
    setIsLoading(true)
    // API call would go here
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            📚
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Join ShareLib</h1>
          <p className="text-muted-foreground">Create your account and start sharing with your community</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-lg p-8 space-y-4">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                required
              />
            </div>
          </div>

          {/* Location Input */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="location"
                name="location"
                type="text"
                placeholder="City, State"
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                required
              />
            </div>
          </div>

          {/* Terms Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="w-4 h-4 rounded border-border mt-1"
              required
            />
            <span className="text-sm text-muted-foreground">
              I agree to the{" "}
              <Link href="#" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={isLoading || !formData.agreeTerms}
            className="w-full py-3 mt-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-lg hover-lift disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? "Creating account..." : "Create Account"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
