import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { CheckCircle2, AlertCircle, Loader2, Mail, Link2 } from "lucide-react";
import { authService } from "@/lib/api/authService";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const urlEmail = searchParams.get("email") || "";
  const urlToken = searchParams.get("token") || "";
  const password = location.state?.password;
  
  const [status, setStatus] = useState<"idle" | "verifying" | "sent" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const { t } = useLanguage();

  const emailSchema = useMemo(
    () => z.string().trim().email(t("verifyEmail.invalidEmail") || "Please enter a valid email address"),
    [t]
  );

  useEffect(() => {
    const verifyFromToken = async () => {
      if (!urlToken) return;
      setStatus("verifying");
      setMessage("");
      try {
        await authService.verifyEmail({ token: urlToken });

        // Optional: auto-login if password was passed from registration
        if (password && urlEmail) {
          try {
            await authService.login({ email: urlEmail, password });
            const user = await authService.fetchMe();
            toast.success(t("verifyEmail.successTitle") || "Email verified successfully!");
            navigate(user.account_type === "PROVIDER" ? "/dashboard" : "/");
            return;
          } catch {
            // If auto-login fails, fall through to success screen
          }
        }

        setStatus("success");
        toast.success(t("verifyEmail.successTitle") || "Email verified successfully!");
      } catch (e: any) {
        setStatus("error");
        const msg =
          e?.message ||
          e?.data?.error ||
          e?.data?.detail ||
          t("verifyEmail.failed") ||
          "Email verification failed.";
        setMessage(msg);
        toast.error(msg);
      }
    };

    verifyFromToken();
  }, [navigate, password, t, urlEmail, urlToken]);

  const handleVerifyCode = async () => {
    if (!urlEmail || !emailSchema.safeParse(urlEmail).success) {
      toast.error(t("verifyEmail.enterValidEmail") || "Please enter a valid email.");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      toast.error(t("verifyEmail.invalidCode") || "Verification code must be 6 digits");
      return;
    }

    setStatus("verifying");
    setMessage("");
    try {
      await authService.verifyEmail({ email: urlEmail, code });

      // Optional: auto-login if password was passed from registration
      if (password) {
        try {
          await authService.login({ email: urlEmail, password });
          const user = await authService.fetchMe();
          toast.success(t("verifyEmail.successTitle") || "Email verified successfully!");
          navigate(user.account_type === "PROVIDER" ? "/dashboard" : "/");
          return;
        } catch {
          // fallthrough
        }
      }

      setStatus("success");
      toast.success(t("verifyEmail.successTitle") || "Email verified successfully!");
    } catch (e: any) {
      setStatus("error");
      const msg =
        e?.message ||
        e?.data?.error ||
        e?.data?.detail ||
        t("verifyEmail.failed") ||
        "Email verification failed.";
      setMessage(msg);
      toast.error(msg);
    }
  };

  const handleResend = async () => {
    if (!urlEmail || !emailSchema.safeParse(urlEmail).success) {
      toast.error(t("verifyEmail.enterValidEmail") || "Please enter a valid email to resend the code.");
      return;
    }
    
    try {
      setStatus("verifying");
      const res: any = await authService.resendVerification(urlEmail);
      setStatus("sent");
      toast.success(res?.message || t("verifyEmail.resendSuccess") || "Verification email resent to your inbox.");
    } catch (error: any) {
      setStatus("idle");
      toast.error(error.message || t("verifyEmail.resendError") || "Failed to resend code.");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center space-y-6">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="text-2xl font-bold font-heading">{t("verifyEmail.successTitle") || "Email Verified"}</h1>
            <p className="text-muted-foreground italic">
              {t("verifyEmail.successDesc") || "Your email has been verified successfully. You can now log in to your account."}
            </p>
            <Link to="/login">
              <Button className="w-full rounded-xl" size="lg">
                {t("verifyEmail.backToLogin") || "Back to Login"}
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-heading">{t("verifyEmail.title")}</h1>
            <p className="mt-2 text-muted-foreground">
              {t("verifyEmail.subtitle")}
            </p>
          </div>

          {/* Token verification state */}
          {status === "verifying" && (
            <div className="flex items-center gap-3 rounded-2xl border bg-muted/20 p-4 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-muted-foreground">{t("verifyEmail.verifying") || "Verifying..."}</span>
            </div>
          )}

          {status === "error" && (
            <div className="mt-4 flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{message}</p>
            </div>
          )}

          {/* Resend / instructions */}
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border bg-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  {urlToken ? <Link2 className="h-4 w-4 text-primary" /> : <Mail className="h-4 w-4 text-primary" />}
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-foreground">
                    {urlToken ? (t("verifyEmail.linkFlowTitle") || "Verifying your link") : (t("verifyEmail.checkInboxTitle") || "Check your inbox")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {urlToken
                      ? (t("verifyEmail.linkFlowDesc") || "We’re confirming your email using the verification link.")
                      : (t("verifyEmail.checkInboxDesc") || "We sent you a 6-digit code. Enter it below to activate your account.")}
                  </div>
                </div>
              </div>

              {urlEmail && (
                <div className="text-xs text-muted-foreground">
                  {t("login.email")}: <span className="font-semibold text-foreground">{urlEmail}</span>
                </div>
              )}
            </div>

            {!urlToken && (
              <div className="rounded-2xl border bg-card p-4 space-y-4">
                <div className="text-sm font-semibold text-foreground text-center">
                  {t("verifyEmail.codeLabel") || "Verification Code"}
                </div>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={(v) => setCode(v)}
                    inputMode="numeric"
                    pattern="\d*"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  type="button"
                  className="w-full rounded-xl"
                  size="lg"
                  onClick={handleVerifyCode}
                  disabled={status === "verifying" || code.length !== 6}
                >
                  {t("verifyEmail.submitBtn") || "Verify Email"}
                </Button>
              </div>
            )}

            <Button
              type="button"
              className="w-full rounded-xl"
              size="lg"
              onClick={handleResend}
              disabled={status === "verifying"}
            >
              {t("verifyEmail.resendBtn")}
            </Button>

            <Link to="/login" className="block">
              <Button variant="outline" className="w-full rounded-xl" size="lg">
                {t("verifyEmail.backToLogin") || "Back to Login"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
