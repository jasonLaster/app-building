import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { updatePassenger } from '../slices/bookingSlice'
import './PassengerForm.css'

function getPassengerLabel(index: number, type: string): string {
  const typeLabel = type === 'adult' ? 'Adult' : type === 'child' ? 'Child' : 'Infant'
  return `Passenger ${index + 1} (${typeLabel})`
}

function PassengerForm() {
  const dispatch = useDispatch<AppDispatch>()
  const passengers = useSelector((state: RootState) => state.booking.passengers)
  const validationErrors = useSelector((state: RootState) => state.booking.validationErrors)

  return (
    <div className="passenger-form" data-testid="passenger-form">
      <h3 className="passenger-form__title">Passenger Information</h3>
      <div className="passenger-form__list">
        {passengers.map((passenger, index) => (
          <PassengerSubForm
            key={index}
            index={index}
            label={getPassengerLabel(index, passenger.passengerType)}
            isPrimary={index === 0}
            passenger={passenger}
            validationErrors={validationErrors}
            dispatch={dispatch}
          />
        ))}
      </div>
    </div>
  )
}

interface PassengerSubFormProps {
  index: number
  label: string
  isPrimary: boolean
  passenger: {
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    email: string
    phone: string
    passengerType: string
  }
  validationErrors: Record<string, string>
  dispatch: AppDispatch
}

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say']

function PassengerSubForm({ index, label, isPrimary, passenger, validationErrors, dispatch }: PassengerSubFormProps) {
  const [genderOpen, setGenderOpen] = useState(false)
  const genderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (genderRef.current && !genderRef.current.contains(e.target as Node)) {
        setGenderOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleChange(field: 'firstName' | 'lastName' | 'dateOfBirth' | 'gender' | 'email' | 'phone', value: string) {
    dispatch(updatePassenger({ index, field, value }))
  }

  function getError(field: string): string | undefined {
    return validationErrors[`${index}-${field}`]
  }

  return (
    <div className="passenger-subform" data-testid={`passenger-subform-${index}`}>
      <div className="passenger-subform__header" data-testid={`passenger-label-${index}`}>
        {label}
      </div>

      <div className="passenger-subform__fields">
        <div className="passenger-subform__row">
          <div className="passenger-subform__field">
            <label className="passenger-subform__label">First name</label>
            <input
              type="text"
              className={`passenger-subform__input ${getError('firstName') ? 'passenger-subform__input--error' : ''}`}
              value={passenger.firstName}
              onChange={e => handleChange('firstName', e.target.value)}
              placeholder="First name"
              data-testid={`passenger-firstname-${index}`}
            />
            {getError('firstName') && (
              <span className="passenger-subform__error" data-testid={`passenger-error-firstname-${index}`}>
                {getError('firstName')}
              </span>
            )}
          </div>

          <div className="passenger-subform__field">
            <label className="passenger-subform__label">Last name</label>
            <input
              type="text"
              className={`passenger-subform__input ${getError('lastName') ? 'passenger-subform__input--error' : ''}`}
              value={passenger.lastName}
              onChange={e => handleChange('lastName', e.target.value)}
              placeholder="Last name"
              data-testid={`passenger-lastname-${index}`}
            />
            {getError('lastName') && (
              <span className="passenger-subform__error" data-testid={`passenger-error-lastname-${index}`}>
                {getError('lastName')}
              </span>
            )}
          </div>
        </div>

        <div className="passenger-subform__row">
          <div className="passenger-subform__field">
            <label className="passenger-subform__label">Date of birth</label>
            <input
              type="date"
              className={`passenger-subform__input ${getError('dateOfBirth') ? 'passenger-subform__input--error' : ''}`}
              value={passenger.dateOfBirth}
              onChange={e => handleChange('dateOfBirth', e.target.value)}
              data-testid={`passenger-dob-${index}`}
            />
            {getError('dateOfBirth') && (
              <span className="passenger-subform__error" data-testid={`passenger-error-dob-${index}`}>
                {getError('dateOfBirth')}
              </span>
            )}
          </div>

          <div className="passenger-subform__field" ref={genderRef}>
            <label className="passenger-subform__label">Gender</label>
            <div
              className={`passenger-subform__dropdown ${getError('gender') ? 'passenger-subform__dropdown--error' : ''}`}
              onClick={() => setGenderOpen(!genderOpen)}
              data-testid={`passenger-gender-${index}`}
            >
              <span className={passenger.gender ? '' : 'passenger-subform__placeholder'}>
                {passenger.gender || 'Select gender'}
              </span>
              <span className="passenger-subform__dropdown-arrow">▾</span>
            </div>
            {genderOpen && (
              <div className="passenger-subform__dropdown-menu" data-testid={`passenger-gender-options-${index}`}>
                {GENDER_OPTIONS.map(option => (
                  <div
                    key={option}
                    className={`passenger-subform__dropdown-option ${passenger.gender === option ? 'passenger-subform__dropdown-option--selected' : ''}`}
                    onClick={() => {
                      handleChange('gender', option)
                      setGenderOpen(false)
                    }}
                    data-testid={`passenger-gender-option-${index}-${option.toLowerCase().replace(/ /g, '-')}`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
            {getError('gender') && (
              <span className="passenger-subform__error" data-testid={`passenger-error-gender-${index}`}>
                {getError('gender')}
              </span>
            )}
          </div>
        </div>

        {isPrimary && (
          <div className="passenger-subform__row">
            <div className="passenger-subform__field">
              <label className="passenger-subform__label">Email address</label>
              <input
                type="email"
                className={`passenger-subform__input ${getError('email') ? 'passenger-subform__input--error' : ''}`}
                value={passenger.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="email@example.com"
                data-testid={`passenger-email-${index}`}
              />
              {getError('email') && (
                <span className="passenger-subform__error" data-testid={`passenger-error-email-${index}`}>
                  {getError('email')}
                </span>
              )}
            </div>

            <div className="passenger-subform__field">
              <label className="passenger-subform__label">Phone number</label>
              <input
                type="tel"
                className={`passenger-subform__input ${getError('phone') ? 'passenger-subform__input--error' : ''}`}
                value={passenger.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="+1 555-123-4567"
                data-testid={`passenger-phone-${index}`}
              />
              {getError('phone') && (
                <span className="passenger-subform__error" data-testid={`passenger-error-phone-${index}`}>
                  {getError('phone')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PassengerForm
