// RegisterForm.jsx
import React from 'react';

const RegisterForm = ({ formData, updateData, onSubmit, toggleForm, error }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div>
      <h1>Register</h1>
      <hr />
      <h2>Become a Legend!</h2>
      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={updateData}
          required
        />
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
          placeholder="New Password"
          value={formData.password}
          onChange={updateData}
          required
        />
        <button type="submit" className="register-button">
          Sign Up
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        Already Legendary?{" "}
        <span onClick={toggleForm} className="toggle-link">
          Log In
        </span>
      </p>
    </div>
  );
};

export default RegisterForm;
