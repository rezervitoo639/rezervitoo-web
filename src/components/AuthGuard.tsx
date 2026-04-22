import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/lib/api/authService";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";

interface AuthGuardProps {
  children: ReactNode;
  allowedAccountType?: "USER" | "PROVIDER";
}

const AuthGuard = ({ children, allowedAccountType }: AuthGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [denyReason, setDenyReason] = useState<string | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = authService.getAccessToken();
        let userData = authService.getUserData();

        if (!token) {
          toast.error(t("errors.auth.loginRequired"));
          setDenyReason(t("errors.auth.loginRequired"));
          navigate("/login", { state: { from: location.pathname } });
          return;
        }

        if (!userData) {
          try {
            userData = await authService.fetchMe();
          } catch (e) {
            authService.clearAuth();
            toast.error(t("errors.auth.sessionExpired"));
            setDenyReason(t("errors.auth.sessionExpired"));
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
            toast.error(t("errors.auth.customerOnly"));
            setDenyReason(t("errors.auth.customerOnly"));
            navigate("/");
            return;
          }
          
          if (allowedAccountType === "PROVIDER" && !isProvider) {
            toast.error(t("errors.auth.providerOnly"));
            setDenyReason(t("errors.auth.providerOnly"));
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
  }, [allowedAccountType, navigate, location.pathname, t]);

  if (isVerifying) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center space-y-4">
          <div className="text-lg font-bold text-foreground">{t("errors.common.somethingWentWrong")}</div>
          <div className="text-sm text-muted-foreground">
            {denyReason || t("errors.auth.loginRequired")}
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate("/login", { state: { from: location.pathname } })} className="rounded-xl">
              {t("nav.login")}
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="rounded-xl">
              {t("nav.home")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
