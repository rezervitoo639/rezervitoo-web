import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { authService } from "@/lib/api/authService";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing verification token.");
        return;
      }

      try {
        await authService.verifyEmail(token);
        setStatus("success");
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Email verification failed.");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <h1 className="text-2xl font-bold font-heading">{t("verifyEmail.verifying")}</h1>
              <p className="text-muted-foreground">{t("verifyEmail.wait")}</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
              <h1 className="text-2xl font-bold font-heading">{t("verifyEmail.successTitle")}</h1>
              <p className="text-muted-foreground italic">
                {t("verifyEmail.successDesc")}
              </p>
              <Link to="/login">
                <Button className="w-full rounded-xl" size="lg">
                  {t("verifyEmail.backToLogin")}
                </Button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <AlertCircle className="mx-auto h-16 w-16 text-destructive" />
              <h1 className="text-2xl font-bold font-heading text-destructive">{t("verifyEmail.failed")}</h1>
              <p className="text-muted-foreground">{message}</p>
              <div className="space-y-3">
                <Link to="/login">
                  <Button variant="outline" className="w-full rounded-xl">
                    {t("verifyEmail.backToLogin")}
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground">
                  {t("verifyEmail.expiredNote")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
