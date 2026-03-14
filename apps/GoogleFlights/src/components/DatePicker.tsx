import { useState, useRef, useEffect } from 'react'
import './DatePicker.css'

interface DatePickerProps {
  value: string | null
  onChange: (date: string | null) => void
  placeholder: string
  minDate?: string | null
  error?: string
  testIdPrefix: string
  initiallyOpen?: boolean
}

function DatePicker({ value, onChange, placeholder, minDate, error, testIdPrefix, initiallyOpen }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen ?? false)
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value + 'T00:00:00')
    return new Date()
  })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const currentMonthStart = new Date()
  currentMonthStart.setDate(1)
  currentMonthStart.setHours(0, 0, 0, 0)

  function formatDateDisplay(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function formatYMD(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate()
  }

  function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay()
  }

  function isDateDisabled(dateStr: string): boolean {
    const d = new Date(dateStr + 'T00:00:00')
    if (d < today) return true
    if (minDate) {
      const min = new Date(minDate + 'T00:00:00')
      if (d < min) return true
    }
    return false
  }

  function canGoPrev(): boolean {
    const viewMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    return viewMonth > currentMonthStart
  }

  function goToPrevMonth() {
    if (!canGoPrev()) return
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  function goToNextMonth() {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  function handleDateClick(dateStr: string) {
    if (isDateDisabled(dateStr)) return
    onChange(dateStr)
    setIsOpen(false)
  }

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const days: (string | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(formatYMD(new Date(year, month, d)))
  }

  return (
    <div className={`date-picker ${error ? 'date-picker--error' : ''}`} ref={ref} data-testid={`${testIdPrefix}-container`}>
      <button
        className="date-picker__trigger"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen && value) {
            setViewDate(new Date(value + 'T00:00:00'))
          }
        }}
        data-testid={`${testIdPrefix}-trigger`}
      >
        <span className="date-picker__icon">📅</span>
        <span className={value ? '' : 'date-picker__placeholder'}>
          {value ? formatDateDisplay(value) : placeholder}
        </span>
      </button>
      {error && <span className="date-picker__error" data-testid={`${testIdPrefix}-error`}>{error}</span>}
      {isOpen && (
        <div className="date-picker__calendar" data-testid={`${testIdPrefix}-calendar`}>
          <div className="date-picker__header">
            <button
              className="date-picker__nav-btn"
              onClick={goToPrevMonth}
              disabled={!canGoPrev()}
              data-testid={`${testIdPrefix}-prev-month`}
            >
              ◀
            </button>
            <span className="date-picker__month-label" data-testid={`${testIdPrefix}-month-label`}>{monthLabel}</span>
            <button
              className="date-picker__nav-btn"
              onClick={goToNextMonth}
              data-testid={`${testIdPrefix}-next-month`}
            >
              ▶
            </button>
          </div>
          <div className="date-picker__weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span key={d} className="date-picker__weekday">{d}</span>
            ))}
          </div>
          <div className="date-picker__days">
            {days.map((dateStr, i) => {
              if (!dateStr) return <span key={`empty-${i}`} className="date-picker__day-empty" />
              const disabled = isDateDisabled(dateStr)
              const selected = value === dateStr
              const dayNum = new Date(dateStr + 'T00:00:00').getDate()
              return (
                <button
                  key={dateStr}
                  className={`date-picker__day ${disabled ? 'date-picker__day--disabled' : ''} ${selected ? 'date-picker__day--selected' : ''}`}
                  onClick={() => handleDateClick(dateStr)}
                  disabled={disabled}
                  data-testid={`${testIdPrefix}-day-${dateStr}`}
                >
                  {dayNum}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default DatePicker
