
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

const ProfileContext = createContext(null)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

const DEFAULT_PREFERENCES = {
  language: 'English',
  timezone: 'Asia/Kolkata',
  emailUpdates: true,
  invoiceAlerts: true,
  productUpdates: false,
  twoFactor: false,
}

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? { ...fallback, ...JSON.parse(saved) } : fallback
  } catch {
    return fallback
  }
}

/**
 * Build a profile object from the user data returned by the backend.
 * Falls back gracefully if fields are missing.
 */
function userToProfile(user) {
  return {
    id: user.id || user._id || '',
    fullName: user.name || user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    avatar: user.avatar || '',
    businessName: user.businessName || '',
    businessEmail: user.businessEmail || user.email || '',
    businessType: user.businessType || 'Wholesale / Distribution',
    businessAddress: user.businessAddress || user.address || '',
    city: user.city || '',
    role: user.role || 'owner',
    createdAt: user.createdAt || '',
  }
}

export function ProfileProvider({ children }) {
  // Try to bootstrap from localStorage (so the first render isn't blank)
  // but the backend is always the source of truth.
  const [profile, setProfile] = useState(() => {
    const stored = readStorage('proofpay-profile', null)
    if (stored && stored.fullName) return stored
    try {
      const user = JSON.parse(localStorage.getItem('proofpay_user') || '{}')
      if (user.name) return userToProfile(user)
    } catch { /* ignore */ }
    return {
      id: '',
      fullName: '',
      email: '',
      phone: '',
      avatar: '',
      businessName: '',
      businessEmail: '',
      businessType: 'Wholesale / Distribution',
      businessAddress: '',
      city: '',
      role: 'owner',
      createdAt: '',
    }
  })

  const [preferences, setPreferences] = useState(() =>
    readStorage('proofpay-preferences', DEFAULT_PREFERENCES)
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /**
   * Fetch the authenticated user's profile from the backend.
   * This is the only source of truth — localStorage is just a cache.
   */
  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('proofpay_token')
    if (!token) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.status === 401) {
        // Token is invalid or expired — clear it
        localStorage.removeItem('proofpay_token')
        localStorage.removeItem('proofpay_user')
        setError('Session expired. Please log in again.')
        return
      }

      const data = await res.json().catch(() => ({}))

      if (data.success && data.user) {
        const p = userToProfile(data.user)
        setProfile(p)
        localStorage.setItem('proofpay-profile', JSON.stringify(p))
        localStorage.setItem('proofpay_user', JSON.stringify(data.user))
      } else {
        setError(data.message || 'Unable to load profile')
      }
    } catch {
      setError('Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch the real profile on mount (if a token exists)
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    localStorage.setItem('proofpay-profile', JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    localStorage.setItem(
      'proofpay-preferences',
      JSON.stringify(preferences)
    )
  }, [preferences])

  function updateProfile(changes) {
    setProfile((current) => ({
      ...current,
      ...changes,
    }))
  }

  const saveProfile = useCallback(async (changes) => {
    const token = localStorage.getItem('proofpay_token')

    // Optimistically update local profile state
    setProfile((current) => {
      const updated = { ...current, ...changes }
      localStorage.setItem('proofpay-profile', JSON.stringify(updated))
      return updated
    })

    if (!token) {
      return { success: true, localOnly: true }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: changes.fullName,
          phone: changes.phone,
          avatar: changes.avatar,
          businessName: changes.businessName,
          businessEmail: changes.businessEmail,
          businessType: changes.businessType,
          businessAddress: changes.businessAddress,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success && data.user) {
        const p = userToProfile(data.user)
        setProfile(p)
        localStorage.setItem('proofpay-profile', JSON.stringify(p))
        localStorage.setItem('proofpay_user', JSON.stringify(data.user))
        return { success: true, user: p }
      } else {
        return { success: false, message: data.message || 'Failed to update profile' }
      }
    } catch (err) {
      return { success: false, message: err.message || 'Network error updating profile' }
    }
  }, [])

  function updatePreferences(changes) {
    setPreferences((current) => ({
      ...current,
      ...changes,
    }))
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        saveProfile,
        preferences,
        updatePreferences,
        loading,
        error,
        fetchProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)

  if (!context) {
    throw new Error(
      'useProfile must be used inside ProfileProvider'
    )
  }

  return context
}
