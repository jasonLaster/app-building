interface AuthToggleProps {
  mode: 'login' | 'register'
  onToggle: () => void
}

function AuthToggle({ mode, onToggle }: AuthToggleProps) {
  return (
    <div className="mt-6 text-center" data-testid="auth-toggle">
      {mode === 'login' ? (
        <p className="text-sm text-text-secondary">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onToggle}
            className="text-primary font-semibold hover:underline cursor-pointer"
            data-testid="auth-toggle-link"
          >
            Register
          </button>
        </p>
      ) : (
        <p className="text-sm text-text-secondary">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onToggle}
            className="text-primary font-semibold hover:underline cursor-pointer"
            data-testid="auth-toggle-link"
          >
            Log In
          </button>
        </p>
      )}
    </div>
  )
}

export default AuthToggle
