"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { API_BASE_URL } from "@/lib/api"

interface UserData {
  username: string;
  role: string;
}

export function HeaderAuth() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token")
      if (token) {
        try {
          const res = await fetch(`${API_BASE_URL}/auth/users/me/`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          })
          if (res.ok) {
            const data = await res.json()
            setUserData(data)
          } else {
            // Token might be invalid
            localStorage.removeItem("access_token")
            localStorage.removeItem("refresh_token")
            setUserData(null)
          }
        } catch (err) {
          console.error("Failed to fetch user", err)
        }
      }
    }
    fetchUser()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    setUserData(null)
    router.push("/login")
  }

  const handleLogin = () => {
    router.push("/login")
  }

  const handleSignup = () => {
    router.push("/signup")
  }

  if (!mounted) {
    return <div className="h-9 w-20"></div>
  }

  if (userData) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{userData.username}</span>
        {userData.role === 'ADMIN' && (
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin")}>
            Admin Panel
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={handleLogin}>
        Login
      </Button>
      <Button variant="default" size="sm" onClick={handleSignup}>
        Sign Up
      </Button>
    </div>
  )
}
