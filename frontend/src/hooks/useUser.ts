"use client"
import { useState, useEffect } from "react"
import { API_BASE_URL } from "@/lib/api"

interface UserData {
  username: string;
  role: string;
}

export function useUser() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
            setUserData(null)
          }
        } catch (err) {
          console.error("Failed to fetch user", err)
          setUserData(null)
        }
      } else {
        setUserData(null)
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  const isAdmin = userData?.role === 'ADMIN'
  const isPlanner = userData?.role === 'PLANNER' || isAdmin
  const isWorker = userData?.role === 'WORKER' || isAdmin
  const isOffice = userData?.role === 'OFFICE' || isAdmin
  const isSales = userData?.role === 'SALES' || isAdmin
  const isAccountant = userData?.role === 'ACCOUNTANT' || isAdmin

  return { 
    userData, 
    loading, 
    isAdmin, 
    isPlanner, 
    isWorker, 
    isOffice, 
    isSales, 
    isAccountant,
    role: userData?.role
  }
}
