import React from 'react';
import './App.css';

function LoginPlaceholder({ onLogin }) {
  return (
    <div className="login-placeholder">
      <h2>Login Required</h2>
      <p>You must be logged in to play. (Demo: just click below to continue)</p>
      <button onClick={onLogin}>Log In</button>
    </div>
  );
}

export default LoginPlaceholder;
