import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatApiError } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/i18n/LanguageContext";
import { authService } from "@/lib/api/authService";
import { GoogleLogin } from "@react-oauth/google";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const registerSchema = useMemo(() => {
    const phoneSchema = z
      .string()
      .trim()
      .refine(
        (val) => /^\d{10}$/.test(val.replace(/[\s\-\.\(\)]/g, "")),
        { message: t("register.phoneInvalid") || "Phone number must be exactly 10 digits." }
      );

    const passwordSchema = z
      .string()
      .min(8, t("register.passwordLength") || "Password must be at least 8 characters.")
      .max(128)
      .regex(/[A-Z]/, t("register.passwordUppercase") || "Password must contain at least 1 uppercase letter.")
      .regex(/[0-9]/, t("register.passwordNumber") || "Password must contain at least 1 number.");

    return z.object({
      accountType: z.enum(["USER", "PROVIDER"]),
      firstName: z.string().trim().min(2).max(100),
      lastName: z.string().trim().min(2).max(100),
      phone: phoneSchema,
      email: z.string().trim().email().max(255),
      password: passwordSchema,
      confirmPassword: z.string(),
      role: z.enum(["HOST", "HOTEL", "HOSTEL", "AGENCY"]).optional(),
      hostType: z.enum(["OWNER", "AGENT"]).optional(),
      hotelName: z.string().optional(),
      stars: z.string().optional(),
      hostelName: z.string().optional(),
      genderRestriction: z.enum(["MALE", "FEMALE", "MIXED"]).optional(),
      agencyName: z.string().optional(),
    })
      .refine((d) => d.password === d.confirmPassword, {
        message: t("register.passwordsMismatch") || "Passwords do not match.",
        path: ["confirmPassword"],
      })
      .refine((d) => { if (d.accountType === "PROVIDER") return !!d.role; return true; }, { path: ["role"] })
      .refine((d) => { if (d.accountType === "PROVIDER" && d.role === "HOST") return !!d.hostType; return true; }, { path: ["hostType"] })
      .refine((d) => { if (d.accountType === "PROVIDER" && d.role === "HOTEL") return !!d.hotelName && !!d.stars; return true; }, { path: ["hotelName"] })
      .refine((d) => { if (d.accountType === "PROVIDER" && d.role === "HOSTEL") return !!d.hostelName && !!d.genderRestriction; return true; }, { path: ["hostelName"] })
      .refine((d) => { if (d.accountType === "PROVIDER" && d.role === "AGENCY") return !!d.agencyName; return true; }, { path: ["agencyName"] });
  }, [t]);

  type RegisterForm = z.infer<typeof registerSchema>;

  const { register, handleSubmit, watch, control, setValue, formState: { errors, isSubmitting } } =
    useForm<RegisterForm>({ resolver: zodResolver(registerSchema), defaultValues: { accountType: "USER" } });
  const accountType = watch("accountType");
  const role = watch("role");

  const onSubmit = async (data: RegisterForm) => {
    try {
      // Map frontend data to backend structure
      const payload: any = {
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone.replace(/[\s\-\.\(\)]/g, ""),
        account_type: accountType, // Using watched value for certainty
      };

      if (accountType === "PROVIDER") {
        payload.role = data.role;
        
        if (data.role === "HOST") {
          payload.host_type = data.hostType;
        } else if (data.role === "HOTEL") {
          payload.hotel_name = data.hotelName;
          payload.stars = data.stars ? parseInt(data.stars) : undefined;
        } else if (data.role === "HOSTEL") {
          payload.hostel_name = data.hostelName;
          payload.gender_restriction = data.genderRestriction;
        } else if (data.role === "AGENCY") {
          payload.agency_name = data.agencyName;
        }

        await authService.registerProvider(payload);
      } else {
        await authService.registerUser(payload);
      }

      toast.success(
        t("register.success") || "Account created! Please check your email inbox for the verification code.",
        { duration: 8000 }
      );

      // Persist for auto-login after OTP verification (survives refresh and cross-tab).
      // Cleared after successful verification/login.
      try {
        localStorage.setItem("pending_verify_email", data.email);
        localStorage.setItem("pending_verify_password", data.password);
      } catch {
        // ignore storage errors (private mode, etc.)
      }

      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`, { 
        state: { password: data.password } 
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(formatApiError(error, t));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md bg-card border rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-4"
            >
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{t("register.creatingAccount") || "Creating Account..."}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("register.pleaseWait") || "Please wait while we set up your account and send a verification code."}
                </p>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "90%" }}
                  transition={{ duration: 10, ease: "linear" }}
                  className="h-full bg-primary"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-auto items-center justify-center"><img src="/logo.png" alt="rezervitoo" className="h-12 w-auto" /></div>
            <h1 className="mt-4 font-heading text-2xl font-bold text-foreground">{t("register.createAccount")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("register.joinAs")}</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <input type="hidden" {...register("accountType")} />
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: "USER", label: t("register.traveler"), desc: t("register.travelerDesc") || "Explore & book stays", img: "/user_role.png" },
                { value: "PROVIDER", label: t("register.serviceProvider"), desc: t("register.providerDesc") || "List & manage properties", img: "/provider_role.png" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("accountType", opt.value)}
                  className={`relative rounded-2xl border-2 overflow-hidden text-left transition-all focus:outline-none ${
                    accountType === opt.value
                      ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="h-40 w-full overflow-hidden bg-muted">
                    <img src={opt.img} alt={opt.label} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
                  </div>
                  <div className={`p-3 transition-colors ${accountType === opt.value ? "bg-primary/5" : "bg-card"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground">{opt.label}</span>
                      <span className={`h-4 w-4 rounded-full border-2 transition-all flex items-center justify-center ${accountType === opt.value ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                        {accountType === opt.value && <span className="h-1.5 w-1.5 rounded-full bg-white block" />}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">{t("register.firstName")}</label>
                <div className="relative mt-2"><User className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" {...register("firstName")} placeholder="John" className="w-full rounded-xl border bg-background py-3 ps-11 pe-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                {errors.firstName && <p className="mt-1.5 text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t("register.lastName")}</label>
                <div className="relative mt-2"><User className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" {...register("lastName")} placeholder="Doe" className="w-full rounded-xl border bg-background py-3 ps-11 pe-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                {errors.lastName && <p className="mt-1.5 text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">{t("register.phone")}</label>
              <div className="relative mt-2">
                <Phone className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={15}
                  {...register("phone")}
                  placeholder="0123456789"
                  className="w-full rounded-xl border bg-background py-3 ps-11 pe-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {errors.phone && <p className="mt-1.5 text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">{t("register.email")}</label>
              <div className="relative mt-2"><Mail className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="email" {...register("email")} placeholder="you@example.com" className="w-full rounded-xl border bg-background py-3 ps-11 pe-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            {accountType === "PROVIDER" && (
              <div className="space-y-5 rounded-xl border bg-muted/30 p-4">
                <h3 className="font-semibold text-sm">{t("register.providerDetails")}</h3>
                <div>
                  <label className="text-sm font-medium text-foreground">{t("register.providerRole")}</label>
                  <Controller name="role" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="mt-2 w-full bg-background"><SelectValue placeholder={t("register.selectRole")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOST">{t("register.host")}</SelectItem>
                        <SelectItem value="HOTEL">{t("register.hotel")}</SelectItem>
                        <SelectItem value="HOSTEL">{t("register.hostel")}</SelectItem>
                        <SelectItem value="AGENCY">{t("register.agency")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                  {errors.role && <p className="mt-1.5 text-xs text-destructive">{errors.role.message}</p>}
                </div>
                {role === "HOST" && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">{t("register.hostType")}</label>
                    <Controller name="hostType" control={control} render={({ field }) => (
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="OWNER" id="r1" /><Label htmlFor="r1">{t("register.propertyOwner")}</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="AGENT" id="r2" /><Label htmlFor="r2">{t("register.agent")}</Label></div>
                      </RadioGroup>
                    )} />
                  </div>
                )}
                {role === "HOTEL" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-foreground">{t("register.hotelName")}</label><input type="text" {...register("hotelName")} className="mt-2 w-full rounded-xl border bg-background py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                    <div><label className="text-sm font-medium text-foreground">{t("register.stars")}</label>
                      <Controller name="stars" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="mt-2 bg-background"><SelectValue placeholder={t("register.stars")} /></SelectTrigger>
                          <SelectContent>{[1,2,3,4,5].map(s => <SelectItem key={s} value={s.toString()}>{s} ⭐</SelectItem>)}</SelectContent>
                        </Select>
                      )} />
                    </div>
                  </div>
                )}
                {role === "HOSTEL" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-foreground">{t("register.hostelName")}</label><input type="text" {...register("hostelName")} className="mt-2 w-full rounded-xl border bg-background py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                    <div><label className="text-sm font-medium text-foreground">{t("register.genderRestriction")}</label>
                      <Controller name="genderRestriction" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="mt-2 bg-background"><SelectValue placeholder="..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MALE">{t("register.maleOnly")}</SelectItem>
                            <SelectItem value="FEMALE">{t("register.femaleOnly")}</SelectItem>
                            <SelectItem value="MIXED">{t("register.mixed")}</SelectItem>
                          </SelectContent>
                        </Select>
                      )} />
                    </div>
                  </div>
                )}
                {role === "AGENCY" && (
                  <div><label className="text-sm font-medium text-foreground">{t("register.agencyName")}</label><input type="text" {...register("agencyName")} className="mt-2 w-full rounded-xl border bg-background py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
                )}
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground">{t("register.password")}</label>
              <div className="relative mt-2"><Lock className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type={showPassword ? "text" : "password"} {...register("password")} placeholder="••••••••" className="w-full rounded-xl border bg-background py-3 ps-11 pe-11 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
              {errors.password && <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">{t("register.confirmPassword")}</label>
              <div className="relative mt-2"><Lock className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type={showPassword ? "text" : "password"} {...register("confirmPassword")} placeholder="••••••••" className="w-full rounded-xl border bg-background py-3 ps-11 pe-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full rounded-xl text-base" size="lg" disabled={isSubmitting}>{isSubmitting ? t("register.creating") : t("register.createBtn")}</Button>
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
                    const roleData: any = {};
                    if (accountType === "PROVIDER") {
                       if (!role) {
                         toast.error(t("register.selectRole") || "Please select a provider role from the form before using Google Sign-up");
                         return;
                       }
                       roleData.role = role;
                    }

                    await authService.loginGoogle({ 
                      id_token: credentialResponse.credential, 
                      account_type: accountType,
                      ...roleData
                    });
                    
                    const user = await authService.fetchMe();
                    if (user.account_type === "PROVIDER") { 
                      toast.success(t("login.welcomeProvider", { name: user.first_name, role: user.role })); 
                      navigate("/dashboard"); 
                    } else { 
                      toast.success(t("login.welcomeCustomer", { name: user.first_name })); 
                      navigate("/"); 
                    }
                  } catch (error: any) {
                    toast.error(error.message || "Google Registration failed");
                  }
                }}
                onError={() => {
                  toast.error("Google Registration Failed");
                }}
              />
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">{t("register.haveAccount")} <Link to="/login" className="font-medium text-primary hover:underline">{t("register.signIn")}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
