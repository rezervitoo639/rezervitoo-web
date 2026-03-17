import { useEffect, useState } from "react";
import { Camera, Upload, CheckCircle2, Clock, AlertCircle, User, Mail, Phone, Building, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import { authService, UserProfile as AuthUser } from "@/lib/api/authService";
import ImageCropper from "@/components/ImageCropper";

const ProviderProfile = () => {
  const { t, language } = useLanguage();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Document upload fields (for HOST)
  const [nationalId, setNationalId] = useState("");
  const [idRecto, setIdRecto] = useState<File | null>(null);
  const [idVerso, setIdVerso] = useState<File | null>(null);

  // Document upload fields (for Business roles: HOTEL, HOSTEL, AGENCY)
  const [nrc, setNrc] = useState("");
  const [nif, setNif] = useState("");
  const [nrcImage, setNrcImage] = useState<File | null>(null);
  const [nifImage, setNifImage] = useState<File | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await authService.fetchMe();
        setUser(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setPhone(data.phone || "");
        setAvatarPreview(data.pfp || null);
      } catch (error) {
        console.error("Failed to load provider profile", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  const statusConfig = {
    VERIFIED: {
      icon: CheckCircle2,
      label: t("providerProfile.verified"),
      className: "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400",
    },
    PENDING: {
      icon: Clock,
      label: t("providerProfile.pendingReview"),
      className: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400",
    },
    UNVERIFIED: {
      icon: AlertCircle,
      label: t("providerProfile.unverified"),
      className: "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
    },
  };

  const status = statusConfig[user.verification_status as keyof typeof statusConfig] || statusConfig.UNVERIFIED;
  const StatusIcon = status.icon;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalImage(URL.createObjectURL(file));
      setCropperOpen(true);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(croppedBlob));
    setEditMode(true);
    toast.success(t("providerProfile.changeAvatar"));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("phone", phone);
      if (avatarFile) {
        formData.append("pfp", avatarFile);
      }

      const data = await authService.updateProfile(formData);
      setUser(data);
      toast.success(t("providerProfile.profileUpdated"));
      setEditMode(false);
      setAvatarFile(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const formData = new FormData();
      
      if (user?.role === "HOST") {
        if (!nationalId || !idRecto || !idVerso) {
          toast.error(t("providerProfile.errorFillDocs"));
          setSaving(false);
          return;
        }
        formData.append("national_id", nationalId);
        formData.append("national_id_recto", idRecto);
        formData.append("national_id_verso", idVerso);
      } else {
        // Business roles: HOTEL, HOSTEL, AGENCY
        if (!nrc || !nif || !nrcImage || !nifImage) {
          toast.error(t("providerProfile.errorFillDocs") || "Please fill all business documentation fields");
          setSaving(false);
          return;
        }
        formData.append("nrc", nrc);
        formData.append("nif", nif);
        formData.append("nrc_image", nrcImage);
        formData.append("nif_image", nifImage);
      }
      
      const data = await authService.updateProfile(formData);
      setUser(data);
      toast.success(t("providerProfile.docsSubmitted"));
    } catch (e: any) {
      toast.error(e.message || "Failed to submit documents");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-8" dir={language === "ar" ? "rtl" : "ltr"}>
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{t("providerProfile.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("providerProfile.subtitle")}</p>
        </div>

        {/* Avatar + Identity Card */}
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-primary/10 bg-accent ring-2 ring-primary/5">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-heading text-4xl font-bold text-accent-foreground">
                    {user.first_name[0]}{user.last_name[0]}
                  </span>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 ${language === "ar" ? "left-0" : "right-0"} flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow`}
                title={t("providerProfile.changeAvatar")}
              >
                <Camera className="h-3.5 w-3.5" />
              </label>
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-heading text-xl font-bold text-foreground truncate">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-accent/40 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                  {user.role}
                </span>
                <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base font-semibold text-foreground">{t("providerProfile.personalInfo")}</h3>
            {!editMode && (
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setEditMode(true)}>
                {t("providerProfile.edit")}
              </Button>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("providerProfile.firstName")}</label>
                {editMode ? (
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                ) : (
                  <div className="mt-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                    <User className="h-4 w-4 text-muted-foreground" /> {user.first_name}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("providerProfile.lastName")}</label>
                {editMode ? (
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                ) : (
                  <div className="mt-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                    <User className="h-4 w-4 text-muted-foreground" /> {user.last_name}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("providerProfile.email")}</label>
              <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" /> {user.email}
                {user.email_verified && (
                  <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle2 className="h-3 w-3" /> {t("providerProfile.verified")}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("providerProfile.phone")}</label>
              {editMode ? (
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0555123456"
                  required
                />
              ) : (
                <div className="mt-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Phone className="h-4 w-4 text-muted-foreground" /> {user.phone}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("providerProfile.accountType")}</label>
              <div className="mt-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                <Building className="h-4 w-4 text-muted-foreground" /> {user.account_type} · {user.role}
              </div>
            </div>

            {editMode && (
              <div className="flex gap-3 pt-2">
                <Button type="submit" size="sm" className="rounded-xl" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("providerProfile.saveChanges")}
                </Button>
                <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => {
                  setFirstName(user.first_name);
                  setLastName(user.last_name);
                  setPhone(user.phone);
                  setAvatarPreview(user.pfp);
                  setAvatarFile(null);
                  setEditMode(false);
                }}>
                  {t("providerProfile.cancel")}
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Verification Documents – only for UNVERIFIED providers */}
        {user.verification_status === "UNVERIFIED" && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-800 dark:bg-orange-900/10">
            <h3 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              {t("providerProfile.submitDocs")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("providerProfile.submitDocsDesc")}
            </p>
            <form onSubmit={handleDocumentSubmit} className="mt-5 space-y-4">
              {user.role === "HOST" ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-foreground">{t("providerProfile.nationalId")}</label>
                    <input
                      type="text"
                      maxLength={18}
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
                      placeholder={t("providerProfile.idNumberPlaceholder")}
                      className="mt-2 w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-foreground">{t("providerProfile.idRecto")}</label>
                      <label className="mt-2 flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background transition-colors hover:border-primary/50">
                        {idRecto ? (
                          <span className="text-sm font-medium text-primary">{idRecto.name}</span>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="mt-1 text-xs text-muted-foreground">{t("providerProfile.uploadImage")}</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setIdRecto(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">{t("providerProfile.idVerso")}</label>
                      <label className="mt-2 flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background transition-colors hover:border-primary/50">
                        {idVerso ? (
                          <span className="text-sm font-medium text-primary">{idVerso.name}</span>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="mt-1 text-xs text-muted-foreground">{t("providerProfile.uploadImage")}</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setIdVerso(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-foreground">NRC (Numéro de Registre de Commerce)</label>
                      <input
                        type="text"
                        value={nrc}
                        onChange={(e) => setNrc(e.target.value)}
                        placeholder="Ex: 22A1234567-00/16"
                        className="mt-2 w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">NIF (Numéro d'Identification Fiscale)</label>
                      <input
                        type="text"
                        maxLength={15}
                        value={nif}
                        onChange={(e) => setNif(e.target.value.replace(/\D/g, ""))}
                        placeholder="15-digit NIF"
                        className="mt-2 w-full rounded-xl border bg-background px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-foreground">NRC Image</label>
                      <label className="mt-2 flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background transition-colors hover:border-primary/50">
                        {nrcImage ? (
                          <span className="text-sm font-medium text-primary">{nrcImage.name}</span>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="mt-1 text-xs text-muted-foreground">{t("providerProfile.uploadImage")}</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setNrcImage(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">NIF Image</label>
                      <label className="mt-2 flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background transition-colors hover:border-primary/50">
                        {nifImage ? (
                          <span className="text-sm font-medium text-primary">{nifImage.name}</span>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="mt-1 text-xs text-muted-foreground">{t("providerProfile.uploadImage")}</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => setNifImage(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                  </div>
                </>
              )}
              <Button type="submit" className="w-full rounded-xl" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("providerProfile.submitForReview")}
              </Button>
            </form>
          </div>
        )}

        {/* Pending status notice */}
        {user.verification_status === "PENDING" && (
          <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-800 dark:bg-orange-900/10">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
            <div>
              <p className="font-semibold text-foreground">{t("providerProfile.docsUnderReview")}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t("providerProfile.docsUnderReviewDesc")}
              </p>
            </div>
          </div>
        )}

        {/* Verified notice */}
        {user.verification_status === "VERIFIED" && (
          <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-900/10">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
            <div>
              <p className="font-semibold text-foreground">{t("providerProfile.accountVerified")}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t("providerProfile.accountVerifiedDesc")}
              </p>
            </div>
          </div>
        )}

        {/* Member since */}
        <p className="text-center text-xs text-muted-foreground">
          {t("providerProfile.memberSince")} {user.created_at ? new Date(user.created_at).toLocaleDateString(language === "ar" ? "ar-DZ" : language === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" }) : ""}
        </p>
      </div>

      {originalImage && (
        <ImageCropper
          image={originalImage}
          open={cropperOpen}
          onOpenChange={setCropperOpen}
          onCropComplete={handleCropComplete}
        />
      )}
    </DashboardLayout>
  );
};

export default ProviderProfile;
