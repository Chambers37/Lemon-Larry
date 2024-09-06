import { useState, useEffect } from "react";
import axios from 'axios';
import LoginForm from './loginForm';
import RegisterForm from './RegisterForm';
import WelcomeMessage from './WelcomeMessage';

const RegisterLogin = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthenticated(true);
    }
  }, []);

  const toggleForm = () => {
    setIsRegister(!isRegister);
    setError("");
  };

  const updateData = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post("/api/v1/users", {
        email: formData.email,
        username: formData.username,
        password: formData.password
      });
      setIsRegister(false); // Switch to login form after successful registration
    } catch (error) {
      setError(error.response.data.message || "Registration failed");
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post("/api/v1/users/Login", {
        username: formData.username,
        password: formData.password
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", formData.username);
      setAuthenticated(true); // Update authenticated state
      window.location.href = "/Login"; // Redirect to homepage
    } catch (error) {
      setError(error.response.data.message || "Login failed");
    }
  };

  const loggingOut = () => {
    localStorage.removeItem('token');
    setAuthenticated(false);
    window.location.href = "/Login";
  }

  if (authenticated) {
    return <WelcomeMessage loggingOut={loggingOut} />;
  }

  return (
    <div className="container">
      <div className="login-section">
        {isRegister ? (
          <RegisterForm
            formData={formData}
            updateData={updateData}
            onSubmit={handleRegister}
            toggleForm={toggleForm}
            error={error}
          />
        ) : (
          <LoginForm
            formData={formData}
            updateData={updateData}
            onSubmit={handleLogin}
            toggleForm={toggleForm}
            error={error}
          />
        )}
      </div>
    </div>
  );
};

export default RegisterLogin;
