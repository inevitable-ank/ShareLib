"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, Lock, ArrowRight } from "lucide-react"
import { useLogin } from "@/app/lib/queries"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const loginMutation = useLogin()

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMessage("Registration successful! Please log in.")
    }
  }, [searchParams])

  useEffect(() => {
    if (loginMutation.isSuccess) {
      router.push("/")
    }
  }, [loginMutation.isSuccess, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ email, password })
  }

  const error = loginMutation.error instanceof Error ? loginMutation.error.message : null
  const isLoading = loginMutation.isPending

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 flex-col justify-center items-center p-8">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-4xl mb-8">
            📚
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-4">Welcome Back</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join your community and share what matters. Borrow items from trusted neighbors.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">✓</div>
              <span className="text-foreground">Share and borrow items</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center text-accent">✓</div>
              <span className="text-foreground">Build community trust</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center text-secondary">
                ✓
              </div>
              <span className="text-foreground">Reduce unnecessary purchases</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-12">
        <div className="max-w-sm mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Sign In</h1>
            <p className="text-muted-foreground">Access your account and start sharing with your community.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Success Message */}
            {successMessage && (
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg text-sm text-accent">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-smooth"
                  required
                />
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <Link href="#" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-lg hover-lift disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? "Signing in..." : "Sign In"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="py-2 px-4 border border-border rounded-lg hover:bg-muted transition-smooth flex items-center justify-center gap-2">
              <span>Google</span>
            </button>
            <button className="py-2 px-4 border border-border rounded-lg hover:bg-muted transition-smooth flex items-center justify-center gap-2">
              <span>Apple</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
