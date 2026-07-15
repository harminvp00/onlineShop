import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/store";
import { fetchCurrentUser } from "../store/authSlice";

const AuthSuccess = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const initSession = async () => {
      try {
        // Fetch current user from server (which uses cookies to authenticate)
        const resultAction = await dispatch(fetchCurrentUser());
        
        if (fetchCurrentUser.fulfilled.match(resultAction)) {
          navigate("/", { replace: true });
        } else {
          navigate("/login?error=oauth_failed", { replace: true });
        }
      } catch (err) {
        console.error("Session verification failed", err);
        navigate("/login?error=oauth_failed", { replace: true });
      }
    };

    initSession();
  }, [dispatch, navigate]);

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      <p style={textStyle}>Completing Google sign-in...</p>
    </div>
  );
};

const containerStyle = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  fontFamily: "Inter, system-ui, sans-serif",
  backgroundColor: "#ffffff",
  color: "#171717",
  gap: "1rem",
};

const spinnerStyle = {
  width: "24px",
  height: "24px",
  border: "2px solid #e5e5e5",
  borderTop: "2px solid #000000",
  borderRadius: "50%",
  animation: "spin 0.6s linear infinite",
};

const textStyle = {
  fontSize: "0.875rem",
  color: "#737373",
};

// Inject keyframe animation dynamically
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default AuthSuccess;
