import { useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import type { RootState } from '../store'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'
import AuthToggle from '../components/AuthToggle'

function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const currentUser = useSelector((state: RootState) => state.auth.currentUser)

  const handleToggle = useCallback(() => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'))
  }, [])

  if (currentUser) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-secondary p-6 max-sm:p-3" data-testid="login-page">
      <section className="w-full max-w-md bg-bg rounded-2xl shadow-lg p-8" aria-labelledby="login-title">
        <header className="text-center mb-8">
          <h1 id="login-title" className="text-2xl font-bold text-primary" data-testid="login-title">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-text-secondary mt-2">
            {mode === 'login'
              ? 'Log in to continue to AirbnbClone'
              : 'Sign up to get started with AirbnbClone'}
          </p>
        </header>

        {mode === 'login' ? <LoginForm key="login" /> : <RegisterForm key="register" />}

        <AuthToggle mode={mode} onToggle={handleToggle} />
      </section>
    </main>
  )
}

export default Login
