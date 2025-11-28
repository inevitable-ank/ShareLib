"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, MapPin, ArrowRight } from "lucide-react"
import { useRegister } from "@/app/lib/queries"

export default function RegisterPage() {
  const router = useRouter()
  const registerMutation = useRegister()
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    agreeTerms: false,
  })

  useEffect(() => {
    if (registerMutation.isSuccess) {
      router.push("/login?registered=true")
    }
  }, [registerMutation.isSuccess, router])

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
      return
    }

    if (formData.password.length < 8) {
      return
    }

    registerMutation.mutate({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password2: formData.confirmPassword,
      first_name: formData.firstName || undefined,
      last_name: formData.lastName || undefined,
      location: formData.location || undefined,
    })
  }

  const error =
    formData.password !== formData.confirmPassword
      ? "Passwords do not match"
      : formData.password.length < 8 && formData.password.length > 0
        ? "Password must be at least 8 characters long"
        : registerMutation.error instanceof Error
          ? registerMutation.error.message
          : null
  const isLoading = registerMutation.isPending

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
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                required
              />
            </div>
          </div>

          {/* First Name Input */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Your first name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
              />
            </div>
          </div>

          {/* Last Name Input */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Your last name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
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
