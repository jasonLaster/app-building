import { useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, NavLink } from 'react-router-dom'
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
    <main className="min-h-screen flex flex-col bg-bg" data-testid="login-page">
      {/* Mini header for login page */}
      <div className="border-b border-border">
        <div className="max-w-[1280px] mx-auto px-6 h-[80px] flex items-center">
          <NavLink to="/" className="header-logo" aria-label="Airbnb home">
            <svg width="102" height="32" viewBox="0 0 102 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M29.24 22.68C29.24 22.04 28.84 21.56 28.2 21.56C27.56 21.56 27.12 22.08 27.12 22.68C27.12 23.32 27.56 23.8 28.2 23.8C28.88 23.8 29.24 23.28 29.24 22.68ZM28.6 19.08H27.8V24.6H28.6V19.08ZM30.76 21.04C30.76 20.48 31.2 20.12 31.8 20.12C32.12 20.12 32.4 20.24 32.56 20.44L33.12 19.96C32.84 19.6 32.36 19.4 31.76 19.4C30.76 19.4 29.96 20.04 29.96 21.04C29.96 22.04 30.76 22.68 31.76 22.68C32.36 22.68 32.84 22.48 33.12 22.12L32.56 21.64C32.4 21.84 32.12 21.96 31.8 21.96C31.2 21.96 30.76 21.6 30.76 21.04ZM25.12 24.6V19.08H24.32V24.6H25.12ZM35.16 22.68C35.16 22.04 34.76 21.56 34.12 21.56C33.48 21.56 33.04 22.08 33.04 22.68C33.04 23.32 33.48 23.8 34.12 23.8C34.8 23.8 35.16 23.28 35.16 22.68ZM36.04 24.6V21.44H35.24V21.88C34.96 21.56 34.56 21.36 34.04 21.36C33.08 21.36 32.28 22 32.28 22.92C32.28 23.84 33.08 24.48 34.04 24.48C34.56 24.48 34.96 24.28 35.24 23.96V24.6H36.04Z" fill="#FF385C"/>
              <path d="M16.84 15.96C16.84 13.24 14.64 11.04 11.92 11.04C9.2 11.04 7 13.24 7 15.96C7 18.68 9.2 20.88 11.92 20.88C14.64 20.88 16.84 18.68 16.84 15.96ZM11.92 6C6.4 6 2 10.4 2 15.96C2 21.48 6.4 25.88 11.92 25.88C17.44 25.88 21.84 21.48 21.84 15.96C21.84 10.4 17.44 6 11.92 6Z" fill="#FF385C"/>
              <text x="22" y="22" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="18" fontWeight="700" fill="#FF385C">airbnb</text>
            </svg>
          </NavLink>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 max-sm:p-4">
        <section className="w-full max-w-[568px] bg-bg rounded-xl shadow-lg border border-border overflow-hidden" aria-labelledby="login-title">
          {/* Modal header */}
          <div className="flex items-center justify-center py-5 px-6 border-b border-border">
            <h2 className="text-base font-bold text-text">
              {mode === 'login' ? 'Log in' : 'Sign up'}
            </h2>
          </div>

          <div className="p-6">
            <h1 id="login-title" className="text-[22px] font-semibold text-text mb-2" data-testid="login-title">
              {mode === 'login' ? 'Welcome to Airbnb' : 'Create your account'}
            </h1>
            <p className="text-text-secondary text-sm mb-6">
              {mode === 'login'
                ? 'Enter your email to log in'
                : 'Sign up to get started'}
            </p>

            {mode === 'login' ? <LoginForm key="login" /> : <RegisterForm key="register" />}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-bg px-4 text-text-secondary">or</span>
              </div>
            </div>

            <AuthToggle mode={mode} onToggle={handleToggle} />
          </div>
        </section>
      </div>
    </main>
  )
}

export default Login
