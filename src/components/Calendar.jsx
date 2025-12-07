import { useState } from 'react'

const Calendar = ({ selectedDate = '', onDateSelect, bookedDates = [] }) => {
  // Ensure bookedDates is always an array
  const safeBookedDates = Array.isArray(bookedDates) ? bookedDates : []
  
  // Ensure onDateSelect is a function
  if (typeof onDateSelect !== 'function') {
    console.warn('Calendar: onDateSelect must be a function')
    return <div>Kalenderfel: onDateSelect är inte en funktion</div>
  }
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const monthNames = [
    'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
  ]

  const weekDays = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1 // Convert Sunday (0) to 6, Monday (1) to 0
  }

  const isDateBooked = (date) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    return safeBookedDates.includes(dateStr)
  }

  const isDatePast = (date) => {
    const dateObj = new Date(currentYear, currentMonth, date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return dateObj < today
  }

  const isDateSelected = (date) => {
    if (!selectedDate) return false
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    return selectedDate === dateStr
  }

  const handleDateClick = (date) => {
    if (isDatePast(date) || isDateBooked(date)) return
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
    if (typeof onDateSelect === 'function') {
      onDateSelect(dateStr)
    }
  }

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
  const days = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button type="button" className="calendar-nav-btn" onClick={goToPreviousMonth}>
          ‹
        </button>
        <h3 className="calendar-month-year">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <button type="button" className="calendar-nav-btn" onClick={goToNextMonth}>
          ›
        </button>
      </div>
      <div className="calendar-weekdays">
        {weekDays.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-days">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="calendar-day empty" />
          }
          const isPast = isDatePast(day)
          const isBooked = isDateBooked(day)
          const isSelected = isDateSelected(day)
          return (
            <button
              key={day}
              type="button"
              className={`calendar-day ${isPast ? 'past' : ''} ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''} ${!isPast && !isBooked ? 'available' : ''}`}
              onClick={() => handleDateClick(day)}
              disabled={isPast || isBooked}
            >
              {day}
            </button>
          )
        })}
      </div>
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color available"></span>
          <span>Tillgänglig</span>
        </div>
        <div className="legend-item">
          <span className="legend-color booked"></span>
          <span>Fullbokat</span>
        </div>
        <div className="legend-item">
          <span className="legend-color selected"></span>
          <span>Vald</span>
        </div>
      </div>
    </div>
  )
}

export default Calendar

