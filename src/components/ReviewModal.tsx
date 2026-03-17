import { useState } from "react";
import { X, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import { supportService } from "@/lib/api/supportService";

interface ReviewModalProps {
  listing: { id: string | number; title: string };
  onClose: () => void;
}

const ReviewModal = ({ listing, onClose }: ReviewModalProps) => {
  const { t, language } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(t("reviewModal.errorRating"));
      return;
    }
    if (comment.length > 0 && comment.length < 10) {
      toast.error(t("reviewModal.errorComment"));
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("listing", listing.id.toString());
      formData.append("rating", rating.toString());
      formData.append("comment", comment);
      
      await supportService.createReview(formData);
      setSubmitted(true);
      toast.success(t("reviewModal.successToast"));
    } catch (error) {
      toast.error(t("common.error") || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const labels = ["", t("reviewModal.poor"), t("reviewModal.fair"), t("reviewModal.good"), t("reviewModal.veryGood"), t("reviewModal.excellent")];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-heading text-lg font-bold text-foreground">{t("reviewModal.title")}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-7 w-7 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
              ))}
            </div>
            <h3 className="font-heading text-xl font-bold text-foreground">{t("reviewModal.submitted")}</h3>
            <p className="text-sm text-muted-foreground">{t("reviewModal.thanks")} <strong>{listing.title}</strong>.</p>
            <Button className="w-full rounded-xl" onClick={onClose}>{t("reviewModal.done")}</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
            <p className="text-sm text-muted-foreground">
              {t("reviewModal.reviewing")} <span className="font-medium text-foreground">{listing.title}</span>
            </p>

            {/* Star Rating */}
            <div>
              <label className="text-sm font-medium text-foreground">{t("reviewModal.yourRating")}</label>
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        s <= (hovered || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
                {(hovered || rating) > 0 && (
                  <span className={`${language === "ar" ? "mr-2" : "ml-2"} text-sm font-medium text-foreground`}>
                    {labels[hovered || rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-medium text-foreground">
                {t("reviewModal.comment")} <span className="text-muted-foreground">{t("reviewModal.commentHint")}</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("reviewModal.placeholder")}
                rows={4}
                maxLength={1000}
                className="mt-2 w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className={`mt-1 text-xs text-muted-foreground ${language === "ar" ? "text-left" : "text-right"}`}>{comment.length}/1000</p>
            </div>

            <Button type="submit" size="lg" className="w-full rounded-xl" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t("reviewModal.submit")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
