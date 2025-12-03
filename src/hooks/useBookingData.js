/**
 * Custom Hook for Booking Data Management
 * 
 * Provides a convenient way to manage booking data with automatic refresh
 * and error handling
 */
import { useState, useEffect, useCallback } from 'react'
import { fetchServices, fetchProviders, fetchBookings } from '../services/booking'

/**
 * Custom hook for managing booking data
 * @param {Object} options - Options
 * @param {boolean} options.autoRefresh - Auto-refresh data periodically (default: false)
 * @param {number} options.refreshInterval - Refresh interval in milliseconds (default: 5 minutes)
 * @returns {Object} Booking data and methods
 */
export function useBookingData(options = {}) {
  const {
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000 // 5 minutes
  } = options

  const [services, setServices] = useState([])
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [servicesData, providersData] = await Promise.all([
        fetchServices(true),
        fetchProviders(true)
      ])

      setServices(servicesData)
      setProviders(providersData)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Error refreshing booking data:', err)
      setError(err.message || 'Kunde inte ladda bokningsdata')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    refresh()
  }, [refresh])

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refresh()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refresh])

  /**
   * Get bookings for a date range
   * @param {Date} fromDate - Start date
   * @param {Date} toDate - End date
   * @param {string} providerId - Optional provider filter
   * @returns {Promise<Array>} Bookings array
   */
  const getBookings = useCallback(async (fromDate, toDate, providerId = null) => {
    try {
      return await fetchBookings(fromDate, toDate, providerId)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      return []
    }
  }, [])

  return {
    services,
    providers,
    loading,
    error,
    lastRefresh,
    refresh,
    getBookings
  }
}

