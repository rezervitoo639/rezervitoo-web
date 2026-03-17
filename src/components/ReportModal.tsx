import { useState } from "react";
import { X, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import { supportService } from "@/lib/api/supportService";
import { API_BASE_URL } from "@/lib/api/config";

interface ReportModalProps {
  listing: { id: string | number; title: string; owner_name: string };
  onClose: () => void;
}

const ReportModal = ({ listing, onClose }: ReportModalProps) => {
  const { t, language } = useLanguage();
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const REPORT_REASONS = [
    t("reportModal.reason1"),
    t("reportModal.reason2"),
    t("reportModal.reason3"),
    t("reportModal.reason4"),
    t("reportModal.reason5"),
    t("reportModal.reason6"),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      toast.error(t("reportModal.errorReason"));
      return;
    }
    const reasonValue = selectedReason === t("reportModal.reason6") ? details : `${selectedReason}${details ? `: ${details}` : ""}`;
    if (!reasonValue.trim() && selectedReason === t("reportModal.reason6")) {
      toast.error(t("reportModal.errorDetails"));
      return;
    }

    setLoading(true);
    try {
      // In our model, reported is the user ID of the provider
      const listingData = await (await fetch(`${API_BASE_URL}/api/v1/listings/${listing.id}/`)).json();
      await supportService.createReport({
        reported: listingData.owner,
        reason: reasonValue
      });
      setSubmitted(true);
      toast.success(t("reportModal.successToast") || "Report submitted successfully");
    } catch (error) {
      toast.error(t("common.error") || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="font-heading text-lg font-bold text-foreground">{t("reportModal.title")}</h2>
          </div>
          <button onClick={onClose} className={`text-muted-foreground hover:text-foreground ${language === "ar" ? "mr-auto" : "ml-auto"}`}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <h3 className="font-heading text-xl font-bold text-foreground">{t("reportModal.submitted")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("reportModal.submittedDesc")} <strong>{listing.owner_name}</strong> {t("reportModal.submittedDesc2")}
            </p>
            <p className="text-xs text-muted-foreground">{t("common.status")}: <span className="font-semibold text-orange-500">{t("common.pending")}</span></p>
            <Button className="w-full rounded-xl" onClick={onClose}>{t("common.close")}</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <p className="text-sm text-muted-foreground">
              {t("reportModal.reporting")} <span className="font-medium text-foreground">{listing.owner_name}</span>
            </p>
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-800 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
              {t("reportModal.warning")}
            </div>

            {/* Reason selection */}
            <div>
              <label className="text-sm font-medium text-foreground">{t("reportModal.reason")}</label>
              <div className="mt-2 space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                      selectedReason === reason
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="accent-primary"
                    />
                    {reason}
                  </label>
                ))}
              </div>
            </div>

            {/* Additional details */}
            <div>
              <label className="text-sm font-medium text-foreground">
                {t("reportModal.additionalDetails")} {selectedReason === t("reportModal.reason6") && <span className="text-destructive">*</span>}
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={t("reportModal.detailsPlaceholder")}
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required={selectedReason === t("reportModal.reason6")}
              />
            </div>

            <Button type="submit" variant="destructive" size="lg" className="w-full rounded-xl" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t("reportModal.submit")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
