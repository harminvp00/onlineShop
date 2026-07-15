import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/store";
import { loginUser, clearError } from "../store/authSlice";
import { ShoppingBag } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { isAuthenticated, error, isLoading } = useAppSelector(
    (state) => state.auth
  );

  const queryError = searchParams.get("error");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearError());
    if (queryError === "oauth_failed") {
      setLocalError("Google sign-in failed. Please try again.");
    } else if (queryError === "no_code") {
      setLocalError("Authorization code not received from Google.");
    }
  }, [queryError, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError("Please fill in all fields.");
      return;
    }
    dispatch(loginUser({ email, password }));
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/accounts/google";
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
          <h2>Discover curated collections.</h2>
          <p>Secure a premium, seamless checkout experience tailored for your lifestyle.</p>
          
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-dot"></div>
              <div className="feature-text">
                <h4>Premium Standards</h4>
                <p>Handpicked products designed to meet top aesthetic and functional requirements.</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-dot"></div>
              <div className="feature-text">
                <h4>Secure Checkouts</h4>
                <p>All data and requests are encrypted with industry-standard protocols.</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-dot"></div>
              <div className="feature-text">
                <h4>Fast Dispatches</h4>
                <p>Real-time inventory checks and instant order execution guarantees rapid delivery.</p>
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
            <h2>Welcome back</h2>
            <p>Please enter your details to sign in</p>
          </div>

          {(error || localError) && (
            <div className="error-alert">
              <span>{error || localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form-body">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
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

            <button
              type="submit"
              disabled={isLoading}
              className="btn-solid"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-or-divider">
            <span>or</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="btn-outline-google"
            type="button"
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.5 3.77v3.13h4.03c2.36-2.17 3.52-5.4 3.52-8.75z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-4.03-3.13c-1.12.75-2.55 1.19-3.93 1.19-3.03 0-5.6-2.05-6.52-4.81H1.31v3.23A12.02 12.02 0 0 0 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.48 14.34a7.22 7.22 0 0 1 0-4.68V6.43H1.31a12.02 12.02 0 0 0 0 11.14l4.17-3.23z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42A11.92 11.92 0 0 0 12 0 12.02 12.02 0 0 0 1.31 6.43l4.17 3.23c.92-2.76 3.49-4.91 6.52-4.91z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
