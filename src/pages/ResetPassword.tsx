import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/api/authService";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/i18n/LanguageContext";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(t("resetPassword.invalidLink"));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("register.passwordsMismatch") || "Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error(t("register.passwordLength") || "Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error(t("register.passwordUppercase") || "Password must contain at least 1 uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      toast.error(t("register.passwordNumber") || "Password must contain at least 1 number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.confirmPasswordReset({
        token,
        new_password: password
      });
      toast.success(t("resetPassword.success"));
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <h1 className="text-2xl font-bold font-heading text-destructive">{t("resetPassword.invalidLink")}</h1>
            <p className="mt-2 text-muted-foreground">{t("resetPassword.invalidLinkDesc")}</p>
            <Link to="/forgot-password">
              <Button className="mt-6 rounded-xl">{t("resetPassword.requestNew")}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="font-heading text-3xl font-bold font-heading">{t("resetPassword.title")}</h1>
            <p className="mt-2 text-muted-foreground leading-relaxed italic">
              {t("resetPassword.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("resetPassword.newPassword")}</label>
                <div className="relative">
                  <Lock className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border bg-background py-3 ps-11 pe-11 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("resetPassword.confirmPassword")}</label>
                <div className="relative">
                  <Lock className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border bg-background py-3 ps-11 pe-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-xl h-12 text-base font-semibold" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                 <>
                   <Loader2 className="me-2 h-4 w-4 animate-spin" />
                   {t("resetPassword.updating")}
                 </>
              ) : t("resetPassword.updateBtn")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
