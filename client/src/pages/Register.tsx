import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/store";
import { registerUser, clearError } from "../store/authSlice";
import { ShoppingBag } from "lucide-react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { isAuthenticated, error, isLoading } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username || !email || !phoneNumber || !password) {
      setLocalError("Please fill in all fields.");
      return;
    }

    if (username.length < 3) {
      setLocalError("Name must be at least 3 characters.");
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      setLocalError("Phone number must be exactly 10 digits.");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    dispatch(
      registerUser({
        username,
        email,
        phoneNumber,
        password,
      })
    );
  };

  return (
    <div className="auth-split-layout">
      {/* Left Panel: Visual Hero */}
      <div className="auth-banner-panel">
        <div className="banner-header">
          <div className="brand-logo">
            <ShoppingBag size={24} />
            <span>OnlineStore</span>
          </div>
        </div>

        <div className="banner-content">
          <h2>Create your customer account.</h2>
          <p>Get access to saved billing methods, rapid checkouts, and custom discounts.</p>
          
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-dot"></div>
              <div className="feature-text">
                <h4>Unified History</h4>
                <p>Track all completed and pending orders directly from your account overview.</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-dot"></div>
              <div className="feature-text">
                <h4>Saved Addresses</h4>
                <p>Register multiple shipping locations for rapid checkout across devices.</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-dot"></div>
              <div className="feature-text">
                <h4>Direct Tracking</h4>
                <p>Access live courier dispatches and arrival updates directly inside your portal.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="banner-footer">
          <p>© 2026 OnlineStore Inc. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel: Content Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Get Started</h2>
            <p>Create a secure store profile to begin shopping</p>
          </div>

          {(error || localError) && (
            <div className="error-alert">
              <span>{error || localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form-body">
            <div className="form-group">
              <label htmlFor="username">Full Name</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number (10 digits)</label>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="9876543210"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-solid"
            >
              {isLoading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
