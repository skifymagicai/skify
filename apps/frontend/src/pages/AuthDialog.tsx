import React from 'react';

const AuthDialog: React.FC = () => (
  <div data-testid="auth-dialog">
    {/* Auth form goes here */}
    <button data-testid="register-tab">Register</button>
    <input data-testid="input-username" placeholder="Username" />
    <input data-testid="input-email" placeholder="Email" />
    <input data-testid="input-password" placeholder="Password" type="password" />
    <button data-testid="toggle-password">Show</button>
    <button data-testid="button-submit">Submit</button>
    <div data-testid="error-alert" style={{ display: 'none' }}>Error</div>
  </div>
);

export default AuthDialog;
