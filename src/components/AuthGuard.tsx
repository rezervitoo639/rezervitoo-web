import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/lib/api/authService";
import { toast } from "sonner";

interface AuthGuardProps {
  children: ReactNode;
  allowedAccountType?: "USER" | "PROVIDER";
}

const AuthGuard = ({ children, allowedAccountType }: AuthGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = authService.getAccessToken();
        let userData = authService.getUserData();

        if (!token) {
          toast.error("Please login to access this page.");
          navigate("/login", { state: { from: location.pathname } });
          return;
        }

        if (!userData) {
          try {
            userData = await authService.fetchMe();
          } catch (e) {
            authService.clearAuth();
            toast.error("Session expired. Please login again.");
            navigate("/login", { state: { from: location.pathname } });
            return;
          }
        }

        const userType = userData?.account_type?.toUpperCase();
        const isAdmin = userType === "ADMIN";
        
        if (allowedAccountType && !isAdmin) {
          const isUser = userType === "USER" || userType === "CLIENT" || userType === "CUSTOMER" || !userType;
          const isProvider = userType === "PROVIDER";
          
          if (allowedAccountType === "USER" && !isUser) {
            toast.error("Access denied. This page is only for customers.");
            navigate("/");
            return;
          }
          
          if (allowedAccountType === "PROVIDER" && !isProvider) {
            toast.error("Access denied. This page is only for providers.");
            if (isUser) navigate("/");
            else navigate("/dashboard");
            return;
          }
        }

        setAuthorized(true);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, [allowedAccountType, navigate, location.pathname]);

  if (isVerifying) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
