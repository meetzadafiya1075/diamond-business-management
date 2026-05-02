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

  const roleUpper = userData?.role?.toUpperCase() || ''
  const isAdmin = roleUpper === 'ADMIN'
  const isPlanner = roleUpper === 'PLANNER' || isAdmin
  const isWorker = roleUpper === 'WORKER' || isAdmin
  const isOffice = roleUpper === 'OFFICE' || isAdmin
  const isSales = roleUpper === 'SALES' || isAdmin
  const isAccountant = roleUpper === 'ACCOUNTANT' || isAdmin

  return { 
    userData, 
    loading, 
    isAdmin, 
    isPlanner, 
    isWorker, 
    isOffice, 
    isSales, 
    isAccountant,
    role: roleUpper
  }
}
