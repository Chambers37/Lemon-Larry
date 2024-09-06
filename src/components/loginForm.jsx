// LoginForm.jsx
import React from 'react';

const LoginForm = ({ formData, updateData, onSubmit, toggleForm, error }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div>
      <h1>LOGIN</h1>
      <hr width="100%" />
      <h2>Login, Legend!</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={updateData}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={updateData}
          required
        />
      {error && <p className="error">{error}</p>}
        <button type="submit" className="login-button">
          Log In
        </button>
        <a href="#" className="forgot-password">
          Forgotten password?
        </a>
      </form>
      <p>
        Don't have an account?{" "}
        <span onClick={toggleForm} className="toggle-link">
          Sign Up
        </span>
      </p>
    </div>
  );
};

export default LoginForm;
