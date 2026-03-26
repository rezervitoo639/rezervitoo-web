import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { authService } from "@/lib/api/authService";
import { useLanguage } from "@/i18n/LanguageContext";
import { GoogleLogin } from "@react-oauth/google";


const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});
type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<"USER" | "PROVIDER">("USER");

  const { t } = useLanguage();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    try {
      await authService.login(data);
      const user = await authService.fetchMe();
      
      if (user.account_type === "PROVIDER") { 
        toast.success(`Welcome back, ${user.first_name}! (${user.role})`); 
        navigate("/dashboard"); 
      } else { 
        toast.success(`Welcome back, ${user.first_name}!`); 
        navigate("/"); 
      }
    } catch (error: any) {
      const isUnverified = error.message?.includes("verify your email") || 
                          error.message?.includes("active account found");
      
      if (isUnverified) {
        toast.error(error.message, {
          action: {
            label: "Resend Email",
            onClick: async () => {
              try {
                await authService.resendVerification(data.email);
                toast.success("Verification email resent!");
              } catch (e: any) {
                toast.error(e.message || "Failed to resend");
              }
            }
          },
          duration: 10000,
        });
      } else {
        toast.error(error.message || "Login failed. Please check your credentials.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-auto items-center justify-center"><img src="/logo.png" alt="rezervitoo" className="h-12 w-auto" /></div>
            <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">{t("login.welcomeBack")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("login.signInToAccount")}</p>
          </div>

          <div className="mt-6 flex justify-center p-1 bg-muted rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setAccountType("USER")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                accountType === "USER" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("register.traveler")}
            </button>
            <button
              type="button"
              onClick={() => setAccountType("PROVIDER")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                accountType === "PROVIDER" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("register.serviceProvider")}
            </button>
          </div>



          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground">{t("login.email")}</label>
              <div className="relative mt-2"><Mail className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="email" {...register("email")} placeholder="you@example.com" className="w-full rounded-xl border bg-background py-3 ps-11 pe-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between"><label className="text-sm font-medium text-foreground">{t("login.password")}</label><Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">{t("login.forgotPassword")}</Link></div>
              <div className="relative mt-2"><Lock className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type={showPassword ? "text" : "password"} {...register("password")} placeholder="••••••••" className="w-full rounded-xl border bg-background py-3 ps-11 pe-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
              {errors.password && <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full rounded-xl text-base" size="lg" disabled={isSubmitting}>{isSubmitting ? t("login.signingIn") : t("login.signIn")}</Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t("common.orContinueWith")}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (!credentialResponse.credential) return;
                  try {
                    const payload: any = { 
                      id_token: credentialResponse.credential, 
                      account_type: accountType 
                    };

                    await authService.loginGoogle(payload);
                    const user = await authService.fetchMe();
                    if (user.account_type === "PROVIDER") { 
                      toast.success(t("login.welcomeProvider", { name: user.first_name, role: user.role })); 
                      navigate("/dashboard"); 
                    } else { 
                      toast.success(t("login.welcomeCustomer", { name: user.first_name })); 
                      navigate("/"); 
                    }
                  } catch (error: any) {
                    toast.error(error.message || "Google Login failed");
                  }
                }}
                onError={() => {
                  toast.error("Google Login Failed");
                }}
              />
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">{t("login.noAccount")} <Link to="/register" className="font-medium text-primary hover:underline">{t("login.createOne")}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
