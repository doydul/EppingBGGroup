import { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const showError = (message) => {
    setError(message);
    setSuccess('');
    setTimeout(() => setError(''), 5000);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 5000);
  };

  return (
    <div className="auth-screen">
      <h1>Board Game Collection</h1>
      <p className="subtitle">Manage your board game library</p>

      {error && <div className="error show">{error}</div>}
      {success && <div className="success show">{success}</div>}

      {isLogin ? (
        <Login
          onToggle={() => setIsLogin(false)}
          showError={showError}
        />
      ) : (
        <Signup
          onToggle={() => setIsLogin(true)}
          showError={showError}
          showSuccess={showSuccess}
        />
      )}
    </div>
  );
}
