import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";
import { authService } from "@/lib/api/authService";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// Schema moved inside component to support dynamic translations

interface VerifyForm {
  email: string;
  code: string;
}

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const urlEmail = searchParams.get("email");
  const password = location.state?.password;
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const { t } = useLanguage();

  const { register, handleSubmit, control, setValue, getValues, formState: { errors, isSubmitting } } = useForm<VerifyForm>({
    resolver: zodResolver(z.object({
      email: z.string().trim().email(t("verifyEmail.invalidEmail") || "Please enter a valid email address"),
      code: z.string().length(6, t("verifyEmail.invalidCode") || "Verification code must be 6 digits"),
    })),
    defaultValues: {
      email: urlEmail || "",
      code: "",
    }
  });

  useEffect(() => {
    if (urlEmail) {
      setValue("email", urlEmail);
    }
  }, [urlEmail, setValue]);

  const onSubmit = async (data: VerifyForm) => {
    setStatus("loading");
    setMessage("");

    try {
      await authService.verifyEmail(data.email, data.code);
      
      // Auto-login if password was passed in state
      if (password) {
        try {
          await authService.login({ email: data.email, password });
          const user = await authService.fetchMe();
          
          toast.success(t("verifyEmail.successTitle") || "Email verified successfully!");
          
          if (user.account_type === "PROVIDER") {
            navigate("/dashboard");
          } else {
            navigate("/");
          }
          return; // Exit early as we are navigating
        } catch (loginError) {
          console.error("Auto-login failed:", loginError);
          // Fallback to success screen if login fails
        }
      }
      
      setStatus("success");
      toast.success(t("verifyEmail.successTitle") || "Email verified successfully!");
    } catch (error: any) {
      setStatus("error");
      const errorMsg = error.message || t("verifyEmail.failed") || "Email verification failed.";
      setMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleResend = async () => {
    const currentEmail = getValues("email");
    if (!currentEmail || !z.string().email().safeParse(currentEmail).success) {
      toast.error(t("verifyEmail.enterValidEmail") || "Please enter a valid email to resend the code.");
      return;
    }
    
    try {
      await authService.resendVerification(currentEmail);
      toast.success(t("verifyEmail.resendSuccess") || "Verification code resent to your email.");
    } catch (error: any) {
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-foreground">{t("login.email")}</label>
              <div className="relative mt-2">
                <Mail className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="email" 
                  {...register("email")} 
                  placeholder="you@example.com" 
                  className="w-full rounded-xl border bg-background py-3 ps-11 pe-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" 
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block text-center">{t("verifyEmail.codeLabel") || "Verification Code"}</label>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={field.value} onChange={field.onChange}>
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
                )}
              />
              {errors.code && <p className="mt-1.5 text-xs text-destructive text-center">{errors.code.message}</p>}
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{message}</p>
              </div>
            )}

            <Button type="submit" className="w-full rounded-xl" size="lg" disabled={isSubmitting || status === "loading"}>
              {status === "loading" ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {t("verifyEmail.verifying")}
                </>
              ) : (
                t("verifyEmail.submitBtn")
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t("verifyEmail.didntReceive")}{" "}
              <button 
                type="button" 
                onClick={handleResend}
                className="font-medium text-primary hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                {t("verifyEmail.resendBtn")}
              </button>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
