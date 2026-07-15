import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/store";

const ProtectedLayout = () => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={loadingTextStyle}>Verifying session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const loadingContainerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  fontFamily: "Inter, system-ui, sans-serif",
  backgroundColor: "#fafafa",
  color: "#171717",
};

const loadingTextStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  letterSpacing: "0.05em",
  textTransform: "uppercase" as const,
};

export default ProtectedLayout;
