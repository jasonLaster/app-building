import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { AppDispatch, RootState } from '../store'
import { loginUser, clearError } from '../slices/authSlice'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [validationError, setValidationError] = useState('')
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state: RootState) => state.auth)

  const validateEmail = (value: string): string => {
    if (!value.trim()) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return 'Please enter a valid email address'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())

    const error = validateEmail(email)
    if (error) {
      setValidationError(error)
      return
    }

    setValidationError('')
    const result = await dispatch(loginUser(email))
    if (loginUser.fulfilled.match(result)) {
      navigate('/')
    }
  }

  const displayError = validationError || error

  return (
    <form onSubmit={handleSubmit} data-testid="login-form" className="space-y-4">
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-text mb-1">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setValidationError('')
          }}
          placeholder="Enter your email"
          aria-required="true"
          aria-describedby={displayError ? 'login-error' : undefined}
          aria-invalid={displayError ? true : undefined}
          className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text"
          data-testid="login-email-input"
        />
      </div>

      <div aria-live="polite">
        {displayError && (
          <p id="login-error" role="alert" className="text-error text-sm" data-testid="login-error">
            {displayError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
        data-testid="login-submit-button"
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  )
}

export default LoginForm
