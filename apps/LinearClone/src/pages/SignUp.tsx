import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store';
import SignUpForm from '../components/SignUpForm';
import './SignUp.css';

export default function SignUp() {
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
    <div className="signup-page" data-testid="signup-page">
      <div className="signup-page-container">
        <SignUpForm />
      </div>
    </div>
  );
}
