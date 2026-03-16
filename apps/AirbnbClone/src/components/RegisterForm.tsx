import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { AppDispatch, RootState } from '../store'
import { registerUser, clearError } from '../slices/authSlice'

function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [validationError, setValidationError] = useState('')
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state: RootState) => state.auth)

  const validate = (): string => {
    if (!name.trim()) return 'Name is required'
    if (!email.trim()) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())

    const error = validate()
    if (error) {
      setValidationError(error)
      return
    }

    setValidationError('')
    const result = await dispatch(registerUser({ name: name.trim(), email: email.trim() }))
    if (registerUser.fulfilled.match(result)) {
      navigate('/')
    }
  }

  const displayError = validationError || error

  return (
    <form onSubmit={handleSubmit} data-testid="register-form" className="space-y-4">
      <div>
        <label htmlFor="register-name" className="block text-sm font-medium text-text mb-1">
          Name
        </label>
        <input
          id="register-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setValidationError('')
          }}
          placeholder="Enter your name"
          aria-required="true"
          aria-describedby={displayError ? 'register-error' : undefined}
          aria-invalid={displayError ? true : undefined}
          className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text"
          data-testid="register-name-input"
        />
      </div>

      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-text mb-1">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setValidationError('')
          }}
          placeholder="Enter your email"
          aria-required="true"
          aria-describedby={displayError ? 'register-error' : undefined}
          aria-invalid={displayError ? true : undefined}
          className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text"
          data-testid="register-email-input"
        />
      </div>

      <div aria-live="polite">
        {displayError && (
          <p id="register-error" role="alert" className="text-error text-sm" data-testid="register-error">
            {displayError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
        data-testid="register-submit-button"
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  )
}

export default RegisterForm
