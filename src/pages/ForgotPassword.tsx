import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/api/authService";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/i18n/LanguageContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await authService.requestPasswordReset(email);
      setIsSuccess(true);
      toast.success(t("forgotPassword.successToast"));
    } catch (error: any) {
      toast.error(error.message || t("errors.common.somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link 
            to="/login" 
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("forgotPassword.backToLogin")}
          </Link>

          {!isSuccess ? (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="font-heading text-3xl font-bold">{t("forgotPassword.title")}</h1>
                <p className="mt-2 text-muted-foreground leading-relaxed italic">
                  {t("forgotPassword.subtitle")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("forgotPassword.emailLabel")}</label>
                  <div className="relative">
                    <Mail className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border bg-background py-3 ps-11 pe-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full rounded-xl h-12 text-base font-semibold" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("forgotPassword.sending") : t("forgotPassword.sendLink")}
                </Button>
              </form>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="text-2xl font-bold font-heading">{t("forgotPassword.successTitle")}</h2>
              <p className="text-muted-foreground leading-relaxed italic">
                {t("forgotPassword.successDesc").replace("{email}", email)}
              </p>
              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">{t("forgotPassword.didNotReceive")}</p>
                <Button 
                  variant="outline" 
                  className="rounded-xl" 
                  onClick={() => setIsSuccess(false)}
                >
                  {t("forgotPassword.tryDifferent")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
