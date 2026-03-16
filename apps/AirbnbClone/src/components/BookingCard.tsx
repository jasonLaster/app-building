import { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import type { RootState, AppDispatch } from '../store'
import type { Property } from '../slices/propertiesSlice'
import { createBooking, clearBookingError } from '../slices/bookingsSlice'

interface BookingCardProps {
  property: Property
}

interface BookedRange {
  check_in: string
  check_out: string
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isDateBooked(dateStr: string, bookedRanges: BookedRange[]): boolean {
  for (const range of bookedRanges) {
    if (dateStr >= range.check_in && dateStr < range.check_out) {
      return true
    }
  }
  return false
}

function isDateInPast(dateStr: string, todayStr: string): boolean {
  return dateStr < todayStr
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function CalendarMonth({
  year,
  month,
  todayStr,
  bookedRanges,
  checkIn,
  checkOut,
  onSelectDate,
}: {
  year: number
  month: number
  todayStr: string
  bookedRanges: BookedRange[]
  checkIn: string
  checkOut: string
  onSelectDate: (dateStr: string) => void
}) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div role="grid" aria-label={`${MONTH_NAMES[month]} ${year}`}>
      <div className="text-center text-sm font-semibold text-text mb-3">
        {MONTH_NAMES[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-text-secondary py-1" role="columnheader">
            {d}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-10" />
          }
          const dateStr = formatDateStr(year, month, day)
          const isPast = isDateInPast(dateStr, todayStr)
          const booked = isDateBooked(dateStr, bookedRanges)
          const disabled = isPast || booked
          const isCheckIn = dateStr === checkIn
          const isCheckOut = dateStr === checkOut
          const isSelected = isCheckIn || isCheckOut
          const inRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut

          return (
            <button
              key={dateStr}
              data-testid={`calendar-day-${dateStr}`}
              disabled={disabled}
              onClick={() => !disabled && onSelectDate(dateStr)}
              aria-label={`${MONTH_NAMES[month]} ${day}, ${year}${isCheckIn ? ' (check-in)' : ''}${isCheckOut ? ' (checkout)' : ''}${booked ? ' (unavailable)' : ''}${isPast ? ' (past date)' : ''}`}
              aria-pressed={isSelected}
              className={`h-10 w-full text-sm rounded-full transition-colors cursor-pointer
                ${disabled ? 'text-border line-through cursor-not-allowed' : 'hover:bg-bg-secondary text-text'}
                ${isSelected ? 'bg-text text-white hover:bg-text' : ''}
                ${inRange ? 'bg-bg-secondary' : ''}
                ${booked ? 'bg-bg-secondary' : ''}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function BookingCard({ property }: BookingCardProps) {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const currentUser = useSelector((state: RootState) => state.auth.currentUser)
  const { loading, error } = useSelector((state: RootState) => state.bookings)

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [success, setSuccess] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([])

  const now = new Date()
  const todayStr = formatDateStr(now.getFullYear(), now.getMonth(), now.getDate())
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false)
  const guestDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(e.target as Node)) {
        setGuestDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isOwnProperty = currentUser?.id === property.host_id

  useEffect(() => {
    fetch(`/api/bookings?property_id=${property.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBookedRanges(data.map((b: { check_in: string; check_out: string }) => ({
            check_in: b.check_in.slice(0, 10),
            check_out: b.check_out.slice(0, 10),
          })))
        }
      })
      .catch(() => {})
  }, [property.id])

  const handleSelectDate = useCallback((dateStr: string) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr)
      setCheckOut('')
    } else {
      if (dateStr <= checkIn) {
        setCheckIn(dateStr)
        setCheckOut('')
      } else {
        // Check if any booked date is between checkIn and this date
        const hasBlockedInRange = bookedRanges.some(
          (r) => r.check_in < dateStr && r.check_out > checkIn
        )
        if (hasBlockedInRange) {
          setCheckIn(dateStr)
          setCheckOut('')
        } else {
          setCheckOut(dateStr)
        }
      }
    }
  }, [checkIn, checkOut, bookedRanges])

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11)
      setCalYear(calYear - 1)
    } else {
      setCalMonth(calMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0)
      setCalYear(calYear + 1)
    } else {
      setCalMonth(calMonth + 1)
    }
  }

  const nextMonth = calMonth === 11 ? 0 : calMonth + 1
  const nextYear = calMonth === 11 ? calYear + 1 : calYear

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
      : 0

  const nightlyTotal = nights * Number(property.price_per_night)
  const cleaningFee = Number(property.cleaning_fee)
  const total = nightlyTotal + cleaningFee

  const canReserve = checkIn && checkOut && nights > 0 && !isOwnProperty && currentUser && !loading

  const handleReserve = async () => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    if (!checkIn || !checkOut || isOwnProperty) return

    dispatch(clearBookingError())
    const result = await dispatch(
      createBooking({
        property_id: property.id,
        guest_id: currentUser.id,
        check_in: checkIn,
        check_out: checkOut,
        num_guests: guests,
        total_price: total,
      })
    )
    if (createBooking.fulfilled.match(result)) {
      setSuccess(true)
      setTimeout(() => navigate('/trips'), 1500)
    }
  }

  const formatDisplayDate = (d: string) => {
    if (!d) return ''
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <aside data-testid="booking-card" className="border border-border rounded-xl p-6 shadow-lg sticky top-[96px]" aria-label="Booking">
      {nights > 0 ? (
        <div className="flex items-baseline gap-1 mb-5">
          <span className="text-[22px] font-semibold text-text">${Number(property.price_per_night).toFixed(0)}</span>
          <span className="text-text-secondary">night</span>
        </div>
      ) : (
        <p className="text-[22px] font-semibold text-text mb-5">Add dates for prices</p>
      )}

      <div className="border border-border rounded-lg overflow-hidden mb-4">
        <button
          type="button"
          className="grid grid-cols-2 cursor-pointer w-full text-left bg-transparent border-0 p-0"
          onClick={() => setCalendarOpen(!calendarOpen)}
          aria-expanded={calendarOpen}
          aria-label="Select check-in and checkout dates"
        >
          <div className="p-3 border-r border-border">
            <span className="block text-[10px] font-bold text-text uppercase tracking-wide">Check-in</span>
            <p data-testid="booking-checkin" className="text-sm text-text-secondary mt-0.5">
              {checkIn ? formatDisplayDate(checkIn) : 'Add date'}
            </p>
          </div>
          <div className="p-3">
            <span className="block text-[10px] font-bold text-text uppercase tracking-wide">Checkout</span>
            <p data-testid="booking-checkout" className="text-sm text-text-secondary mt-0.5">
              {checkOut ? formatDisplayDate(checkOut) : 'Add date'}
            </p>
          </div>
        </button>
        <div className="border-t border-border p-3 relative" ref={guestDropdownRef}>
          <span id="guests-label" className="block text-[10px] font-bold text-text uppercase tracking-wide">Guests</span>
          <button
            data-testid="booking-guests"
            data-value={String(guests)}
            type="button"
            onClick={() => setGuestDropdownOpen(!guestDropdownOpen)}
            aria-expanded={guestDropdownOpen}
            aria-haspopup="listbox"
            aria-labelledby="guests-label"
            className="w-full flex items-center justify-between text-sm text-text bg-transparent outline-none mt-0.5 cursor-pointer"
          >
            <span>{guests} {guests === 1 ? 'guest' : 'guests'}</span>
            <ChevronDown size={16} aria-hidden="true" className={`transition-transform ${guestDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {guestDropdownOpen && (
            <div data-testid="booking-guests-dropdown" role="listbox" aria-label="Number of guests" className="absolute left-0 right-0 top-full mt-1 bg-bg border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {Array.from({ length: property.max_guests }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  data-testid={`guest-option-${n}`}
                  type="button"
                  role="option"
                  aria-selected={guests === n}
                  onClick={() => { setGuests(n); setGuestDropdownOpen(false) }}
                  className={`w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors
                    ${guests === n ? 'bg-bg-secondary font-semibold text-text' : 'text-text hover:bg-bg-secondary'}
                  `}
                >
                  {n} {n === 1 ? 'guest' : 'guests'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {calendarOpen && (
        <div className="mb-4 border border-border rounded-xl p-4 bg-bg shadow-sm">
          <div className="mb-3">
            <h3 className="text-base font-semibold text-text">Select dates</h3>
            <p className="text-xs text-text-secondary">Add your travel dates for exact pricing</p>
          </div>
          <div className="flex items-center justify-between mb-2">
            <button
              data-testid="calendar-prev-month"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1 rounded-full hover:bg-bg-secondary cursor-pointer"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <div />
            <button
              data-testid="calendar-next-month"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1 rounded-full hover:bg-bg-secondary cursor-pointer"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-6">
            <CalendarMonth
              year={calYear}
              month={calMonth}
              todayStr={todayStr}
              bookedRanges={bookedRanges}
              checkIn={checkIn}
              checkOut={checkOut}
              onSelectDate={handleSelectDate}
            />
            <CalendarMonth
              year={nextYear}
              month={nextMonth}
              todayStr={todayStr}
              bookedRanges={bookedRanges}
              checkIn={checkIn}
              checkOut={checkOut}
              onSelectDate={handleSelectDate}
            />
          </div>
          <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-border">
            <button
              onClick={() => { setCheckIn(''); setCheckOut('') }}
              className="text-sm font-semibold text-text underline hover:no-underline cursor-pointer"
            >
              Clear dates
            </button>
            <button
              onClick={() => setCalendarOpen(false)}
              className="text-sm font-semibold text-white bg-text rounded-lg px-4 py-2 hover:opacity-90 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {nights > 0 && (
        <div data-testid="price-breakdown" className="mb-4 space-y-2 text-sm">
          <div className="flex justify-between text-text-secondary">
            <span className="underline">${Number(property.price_per_night).toFixed(0)} x {nights} {nights === 1 ? 'night' : 'nights'}</span>
            <span>${nightlyTotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span className="underline">Cleaning fee</span>
            <span>${cleaningFee.toFixed(0)}</span>
          </div>
          <div className="flex justify-between font-semibold text-text pt-3 border-t border-border">
            <span>Total</span>
            <span>${total.toFixed(0)}</span>
          </div>
        </div>
      )}

      {isOwnProperty ? (
        <p data-testid="own-property-message" className="text-center text-text-secondary text-sm mb-2">
          You cannot book your own property
        </p>
      ) : !currentUser ? (
        <button
          data-testid="booking-login-prompt"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-[#E61E4D] text-white font-semibold hover:opacity-95 transition-opacity cursor-pointer text-base"
          onClick={() => navigate('/login')}
        >
          Log in to reserve
        </button>
      ) : (
        <button
          data-testid="reserve-button"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-[#E61E4D] text-white font-semibold hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-base"
          disabled={!canReserve}
          onClick={handleReserve}
        >
          {loading ? 'Reserving...' : 'Reserve'}
        </button>
      )}

      {!checkIn && !checkOut && currentUser && !isOwnProperty && (
        <p className="text-center text-text-secondary text-xs mt-3">You won't be charged yet</p>
      )}

      {error && (
        <p data-testid="booking-error" role="alert" className="text-error text-sm mt-2 text-center">{error}</p>
      )}

      {success && (
        <p data-testid="booking-success" role="status" aria-live="polite" className="text-success text-sm mt-2 text-center font-semibold">
          Booking confirmed! Redirecting...
        </p>
      )}
    </aside>
  )
}
