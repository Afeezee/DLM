import { useState } from 'react'

const initialBooking = {
  addonPhotobooth: false,
  address: '',
  date: '',
  notes: '',
  serviceType: 'walk-in',
  timeSlot: '',
}

export function useBooking() {
  const [booking, setBooking] = useState(initialBooking)

  const updateBooking = (field, value) => {
    setBooking((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const resetBooking = () => setBooking(initialBooking)

  return {
    booking,
    resetBooking,
    updateBooking,
  }
}