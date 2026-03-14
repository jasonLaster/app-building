import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store';
import LoginForm from '../components/LoginForm';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      navigate('/my-issues', { replace: true });
    }
  }, [token, navigate]);

  if (token) {
    return null;
  }

  return (
    <div className="login-page" data-testid="login-page">
      <div className="login-page-container">
        <LoginForm />
      </div>
    </div>
  );
}
