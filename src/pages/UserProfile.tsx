import { useEffect, useState } from "react";
import { Camera, CheckCircle2, User, Mail, Phone, Calendar, Loader2, Heart, CalendarCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import { authService, UserProfile as AuthUser } from "@/lib/api/authService";
import ImageCropper from "@/components/ImageCropper";

const UserProfile = () => {
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
        console.error("Failed to load user profile", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

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
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">{t("nav.profile")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("providerProfile.subtitle")}</p>
          </div>

          {/* User Info Card */}
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <div className="flex items-center gap-5">
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
                  className={`absolute bottom-0 ${language === "ar" ? "left-0" : "right-0"} flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow transition-transform hover:scale-110`}
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
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-accent/40 px-2.5 py-0.5 text-xs font-semibold text-foreground uppercase tracking-wider">
                    {t("nav.customer")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h3 className="font-heading text-base font-semibold text-foreground border-b pb-3 mb-4">{t("dashboard.quickActions")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/my-bookings" className="flex flex-col items-center gap-3 rounded-2xl border bg-background p-4 transition-all hover:border-primary hover:bg-primary/5 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <CalendarCheck className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold">{t("nav.myBookings")}</span>
              </Link>
              <Link to="/wishlist" className="flex flex-col items-center gap-3 rounded-2xl border bg-background p-4 transition-all hover:border-primary hover:bg-primary/5 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <Heart className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold">{t("nav.wishlist")}</span>
              </Link>
            </div>
          </div>

          {/* Details Form */}
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-base font-semibold text-foreground">{t("providerProfile.personalInfo")}</h3>
              {!editMode && (
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setEditMode(true)}>
                  {t("providerProfile.edit")}
                </Button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
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

              <div className="pt-2">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("providerProfile.memberSince")}</label>
                <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" /> 
                  {user.created_at ? new Date(user.created_at).toLocaleDateString(language === "ar" ? "ar-DZ" : language === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                </div>
              </div>

              {editMode && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button type="submit" className="rounded-xl" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("providerProfile.saveChanges")}
                  </Button>
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => {
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
        </div>
      </main>

      <Footer />

      {originalImage && (
        <ImageCropper
          image={originalImage}
          open={cropperOpen}
          onOpenChange={setCropperOpen}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};

export default UserProfile;
