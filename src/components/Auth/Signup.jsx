import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Signup({ onToggle, showError, showSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!username.trim() || !password.trim()) {
      showError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      showSuccess('Account created! Signing you in...');
      await signup(username, password);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="signupUsername">Username</label>
        <input
          type="text"
          id="signupUsername"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      <div className="form-group">
        <label htmlFor="signupPassword">Password</label>
        <input
          type="password"
          id="signupPassword"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
      <div className="toggle-auth">
        Already have an account?{' '}
        <button type="button" onClick={onToggle}>Sign in</button>
      </div>
    </form>
  );
}
