// WelcomeMessage.jsx
import React from 'react';

const WelcomeMessage = ({ loggingOut }) => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1>Welcome back, Legend!</h1>
        <hr width="100%"></hr>
        <h3>Top scores here</h3>
        <div>
          <button className="logout-button" onClick={loggingOut}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;
