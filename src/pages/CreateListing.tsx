import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Upload, Plus, Trash2, AlertTriangle, Loader2, Check, 
  ChevronRight, ChevronLeft, MapPin, Info, Settings, 
  ListChecks, CalendarDays, Image as ImageIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { authService, UserProfile } from "@/lib/api/authService";
import { listingService, Amenity, Restriction, Nearby, getTranslatedName } from "@/lib/api/listingService";
import { useLanguage } from "@/i18n/LanguageContext";
import MapLocationPicker from "@/components/MapLocationPicker";
import { compressImage } from "@/lib/utils/imageUtils";
import { getWilayas, getCommunes, Wilaya } from "@/lib/algeriaLocations";
import { Skeleton } from "@/components/ui/skeleton";

// Listing types and roles mapping
type ListingType = "PROPERTY" | "HOTEL_ROOM" | "HOSTEL_BED" | "TRAVEL_PACKAGE";
type ProviderRole = "HOST" | "HOTEL" | "HOSTEL" | "AGENCY";

const ROLE_TO_LISTING_TYPE: Record<string, ListingType> = {
  HOST: "PROPERTY",
  HOTEL: "HOTEL_ROOM",
  HOSTEL: "HOSTEL_BED",
  AGENCY: "TRAVEL_PACKAGE",
};

const propertyTypes = ["HOUSE", "APARTMENT", "VILLA", "CABIN", "STUDIO"];
const roomCategories = ["SINGLE", "DOUBLE", "SUITE", "DELUXE", "FAMILY"];
const packageTypes = ["LOCAL", "HAJJ", "UMRAH", "INTERNATIONAL"];

// ─── Component ─────────────────────────────────────────────────────────────
const CreateListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isEditMode = !!id;

  const [user, setUser] = useState<UserProfile | null>(authService.getUserData());
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Metadata from API
  const [apiAmenities, setApiAmenities] = useState<Amenity[]>([]);
  const [apiRestrictions, setApiRestrictions] = useState<Restriction[]>([]);
  const [apiNearby, setApiNearby] = useState<Nearby[]>([]);
  const [apiBedTypes, setApiBedTypes] = useState<{ id: number; name: string; icon: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, amens, rests, near, beds] = await Promise.all([
          authService.fetchMe(),
          listingService.fetchAmenities(),
          listingService.fetchRestrictions(),
          listingService.fetchNearby(),
          listingService.fetchBedTypes()
        ]);
        setUser(userData);
        setApiAmenities(amens);
        setApiRestrictions(rests);
        setApiNearby(near);
        setApiBedTypes(beds);

        // Set Wilayas from helper
        const uniqueWilayas = getWilayas();
        setWilayas(uniqueWilayas);

        // If edit mode, fetch existing listing details
        if (id) {
          const listing = await listingService.fetchListingById(id);
          setTitle(listing.title);
          setDescription(listing.description);
          setPrice(listing.price);
          setNegotiable(!!listing.negotiable);
          setLocationText(listing.location_text || "");
          setLat(listing.location_lat || 36.7538);
          setLng(listing.location_lng || 3.0588);
          
          // Set state/province if editing (mapping from backend fields)
          if (listing.state) setSelectedWilaya(listing.state);
          if (listing.province) setSelectedCommune(listing.province);
          
          setSelectedAmenities(listing.amenity_details?.map(a => a.id) || []);
          setSelectedRestrictions(listing.restriction_details?.map(r => r.id) || []);
          setSelectedNearby(listing.nearby_details?.map(n => n.id) || []);
          // ... rest of editing logic

          if (listing.listing_type === "PROPERTY") {
            setPropertyType(listing.property_type);
            setBedrooms(String(listing.bedrooms));
            setBathrooms(String(listing.bathrooms));
            setMaxGuests(String(listing.max_guests));
            setMinDuration(String(listing.min_duration));
            setBedsConfig(listing.beds.map(b => ({ bed_type_id: b.bed_type_details.id, quantity: b.quantity })));
          } else if (listing.listing_type === "HOTEL_ROOM") {
            setRoomCategory(listing.room_category);
            setMaxGuests(String(listing.max_guests));
            setMinDuration(String(listing.min_duration));
            setQuantity(String(listing.quantity));
            setBedsConfig(listing.beds.map(b => ({ bed_type_id: b.bed_type_details.id, quantity: b.quantity })));
          } else if (listing.listing_type === "HOSTEL_BED") {
            setHostelRoomType(listing.room_type);
            setGenderRestriction(listing.gender);
            setMaxGuests(String(listing.max_guests));
            setQuantity(String(listing.quantity));
            setBedsConfig(listing.beds.map(b => ({ bed_type_id: b.bed_type_details.id, quantity: b.quantity })));
          } else if (listing.listing_type === "TRAVEL_PACKAGE") {
            setPackageType(listing.package_type);
            setItinerary(listing.itinerary_items.map(item => ({ 
              day: item.day, 
              title: item.title, 
              description: item.description 
            })));
            setSchedules(listing.schedules.map(s => ({ 
              id: s.id,
              start_date: s.start_date, 
              max_capacity: s.max_capacity 
            })));
          }
          
          // Set previews for existing images
          setCoverPreview(listing.cover_image);
          setGalleryPreviews(listing.images.map(img => img.image));
        }
      } catch (error) {
        console.error("Failed to fetch data in CreateListing", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Derive role + listing type from session
  const role = user?.role as ProviderRole | undefined;
  const listingType: ListingType | null = role ? ROLE_TO_LISTING_TYPE[role] : null;

  // ── Form States
  // Step 1: Basics
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);

  // Step 2: Location & Core Specs
  const [locationText, setLocationText] = useState("");
  const [lat, setLat] = useState<number>(36.7538);
  const [lng, setLng] = useState<number>(3.0588);
  
  // Algeria Cities Data
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");

  // Type specific details
  const [propertyType, setPropertyType] = useState("APARTMENT");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [roomCategory, setRoomCategory] = useState("DOUBLE");
  const [hostelRoomType, setHostelRoomType] = useState("DORM");
  const [genderRestriction, setGenderRestriction] = useState("MALE");
  const [packageType, setPackageType] = useState("LOCAL");
  const [quantity, setQuantity] = useState("1");
  const [maxGuests, setMaxGuests] = useState("2");
  const [minDuration, setMinDuration] = useState("1");

  // Step 3: Features & Rules
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState<number[]>([]);
  const [selectedNearby, setSelectedNearby] = useState<number[]>([]);

  // Step 4: Configuration (Beds or Itinerary)
  // uploaded_beds: [{"bed_type_id": 2, "quantity": 2}, {"bed_type_id": 1, "quantity": 4}]
  const [bedsConfig, setBedsConfig] = useState<{ bed_type_id: number; quantity: number }[]>([]);
  const [itinerary, setItinerary] = useState([
    { day: 1, title: "Arrival", description: "" },
    { day: 2, title: "Departure", description: "" },
  ]);
  const [schedules, setSchedules] = useState<{ id?: number; start_date: string, max_capacity: number }[]>([{ start_date: "", max_capacity: 20 }]);
  const [deletedSchedules, setDeletedSchedules] = useState<number[]>([]);

  // Step 5: Media
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ── Handlers
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setGalleryImages(prev => [...prev, ...files]);
      setGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleMetadata = (id: number, type: "amenities" | "restrictions" | "nearby") => {
    const setterMap = {
      amenities: setSelectedAmenities,
      restrictions: setSelectedRestrictions,
      nearby: setSelectedNearby
    };
    const stateMap = {
      amenities: selectedAmenities,
      restrictions: selectedRestrictions,
      nearby: selectedNearby
    };
    
    const current = stateMap[type];
    const setter = setterMap[type];

    if (current.includes(id)) {
      setter(current.filter(x => x !== id));
    } else {
      setter([...current, id]);
    }
  };

  // Itinerary helpers
  const addDay = () => setItinerary(prev => {
    const count = prev.length;
    const last = prev[count - 1];
    const newItems = [...prev];
    newItems[count - 1] = { day: count, title: "", description: "" };
    newItems.push({ day: count + 1, title: "Departure", description: "" });
    return newItems;
  });

  const removeDay = (idx: number) => {
    if (itinerary.length <= 2) return;
    const filtered = itinerary.filter((_, i) => i !== idx);
    const remapped = filtered.map((item, i) => ({ 
      ...item, 
      day: i + 1,
      title: i === 0 ? "Arrival" : (i === filtered.length - 1 ? "Departure" : item.title)
    }));
    setItinerary(remapped);
  };

  const updateItinerary = (idx: number, field: string, val: string) => {
    const updated = [...itinerary];
    updated[idx] = { ...updated[idx], [field]: val };
    setItinerary(updated);
  };

  // Bed helpers
  const addBedType = (typeId: number) => {
    setBedsConfig(prev => {
      const existing = prev.find(b => b.bed_type_id === typeId);
      if (existing) return prev;
      return [...prev, { bed_type_id: typeId, quantity: 1 }];
    });
  };

  const updateBedQuantity = (typeId: number, qty: number) => {
    setBedsConfig(prev => prev.map(b => b.bed_type_id === typeId ? { ...b, quantity: Math.max(1, qty) } : b));
  };

  const removeBed = (typeId: number) => {
    setBedsConfig(prev => prev.filter(b => b.bed_type_id !== typeId));
  };

  // Schedule helpers
  const addSchedule = () => setSchedules(prev => [...prev, { start_date: "", max_capacity: 20 }]);
  const removeSchedule = (idx: number) => {
    const toRemove = schedules[idx];
    if (toRemove.id) {
      setDeletedSchedules(prev => [...prev, toRemove.id!]);
    }
    setSchedules(prev => prev.filter((_, i) => i !== idx));
  };
  const updateSchedule = (idx: number, field: string, val: any) => {
    const updated = [...schedules];
    updated[idx] = { ...updated[idx], [field]: val };
    setSchedules(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
      return;
    }

    if (!isEditMode) {
      if (!coverImage) { toast.error("Cover image is required"); return; }
      if (galleryImages.length < 5) { toast.error("At least 5 gallery images are required"); return; }
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("negotiable", String(negotiable));
      formData.append("location_text", locationText);
      formData.append("location_lat", String(lat));
      formData.append("location_lng", String(lng));
      formData.append("state", selectedWilaya);
      formData.append("province", selectedCommune);

      // ── Process and Compress Images
      setUploadProgress(1); // Start progress at 1% to show it's working
      
      // Compress Cover Image
      if (coverImage) {
        const compressedCover = await compressImage(coverImage, 2048, 0.85);
        formData.append("cover_image", compressedCover, "cover.jpg");
      }
      
      // Compress Gallery Images
      for (let i = 0; i < galleryImages.length; i++) {
        const compressedImg = await compressImage(galleryImages[i], 1920, 0.8);
        formData.append("uploaded_images", compressedImg, `gallery_${i}.jpg`);
        // Update progress slightly during compression phase (0-10%)
        setUploadProgress(Math.floor((i + 1) / galleryImages.length * 10));
      }

      selectedAmenities.forEach(id => formData.append("amenities", String(id)));
      selectedRestrictions.forEach(id => formData.append("restrictions", String(id)));
      selectedNearby.forEach(id => formData.append("nearby", String(id)));

      if (listingType === "PROPERTY") {
        formData.append("property_type", propertyType);
        formData.append("bedrooms", bedrooms);
        formData.append("bathrooms", bathrooms);
        formData.append("max_guests", maxGuests);
        formData.append("min_duration", minDuration);
        formData.append("quantity", quantity);
        formData.append("uploaded_beds", JSON.stringify(bedsConfig));
      } else if (listingType === "HOTEL_ROOM") {
        formData.append("room_category", roomCategory);
        formData.append("max_guests", maxGuests);
        formData.append("min_duration", minDuration);
        formData.append("quantity", quantity);
        formData.append("uploaded_beds", JSON.stringify(bedsConfig));
      } else if (listingType === "HOSTEL_BED") {
        formData.append("room_type", hostelRoomType);
        formData.append("gender", genderRestriction);
        formData.append("max_guests", maxGuests);
        formData.append("quantity", quantity);
        formData.append("uploaded_beds", JSON.stringify(bedsConfig));
      } else if (listingType === "TRAVEL_PACKAGE") {
        formData.append("package_type", packageType);
        formData.append("duration_days", String(itinerary.length));
        formData.append("uploaded_itinerary", JSON.stringify(itinerary));
        formData.append("uploaded_schedules", JSON.stringify(schedules));
      }

      let createdListing: any;
      if (isEditMode) {
        createdListing = await listingService.updateListing(id, formData, (progress) => {
          setUploadProgress(progress);
        });
        toast.success(t("createListing.successUpdated"));
      } else {
        createdListing = await listingService.createListing(formData, (progress) => {
          setUploadProgress(progress);
        });
        toast.success(t("createListing.successPublished"));
      }

      // ── Process Schedules (TRAVEL_PACKAGE only)
      // Schedules are sent via 'uploaded_schedules' in the multipart form data during listing creation/update.
      // There is no separate /schedules/ endpoint, so we don't make subsequent API calls here.
      if (listingType === "TRAVEL_PACKAGE") {
        setUploadProgress(100); 
      }

      navigate("/dashboard/listings");
    } catch (error: any) {
      console.error("Publication failed", error);
         if (error.status === 403) {
        toast.error(t("createListing.error403"));
      } else if (error.status === 401) {
        toast.error(t("createListing.error401"));
      } else {
        toast.error(`${t("createListing.errorGeneric")} ${error instanceof Error ? error.message : "Error"}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-8 px-4">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-3">
              <Skeleton className="h-10 w-64 rounded-xl" />
              <Skeleton className="h-4 w-48 rounded-lg" />
            </div>
            <Skeleton className="h-12 w-32 rounded-2xl" />
          </div>
          
          <div className="mb-12 flex items-center justify-between gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-1 items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                {i < 5 && <Skeleton className="h-1 w-full rounded-full" />}
              </div>
            ))}
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl border bg-card/50 p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-32 rounded-lg" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-14 w-full rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-14 w-full rounded-2xl" />
                  </div>
                  <div className="flex items-end flex-col gap-2">
                    <Skeleton className="h-14 w-full rounded-2xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.account_type !== "PROVIDER" || !listingType) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <AlertTriangle className="h-12 w-12 text-orange-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">{t("createListing.roleNotDetected")}</h2>
          <p className="text-muted-foreground max-w-md">{t("createListing.roleNotDetectedDesc")}</p>
          <Button onClick={() => navigate("/login")} className="mt-6 rounded-xl">{t("nav.login")}</Button>
        </div>
      </DashboardLayout>
    );
  }

  const UploadProgressOverlay = () => (
    <AnimatePresence>
      {submitting && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-card border rounded-3xl p-8 shadow-2xl space-y-6"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <Upload className="h-8 w-8 text-primary animate-bounce" />
              </div>
              <h3 className="text-xl font-bold">
                {uploadProgress < 12 ? (t("common.optimizing") || "Optimizing & Uploading...") : (t("common.uploading") || "Uploading Images...")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {uploadProgress < 12 
                  ? (t("createListing.optimizingDesc") || "Compressing your images for faster upload...")
                  : (t("createListing.uploadingDesc") || "Please wait while we process and upload your listing media.")}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>{uploadProgress}%</span>
                <span>{uploadProgress === 100 ? "Finalizing..." : "In Progress"}</span>
              </div>
              <Progress value={uploadProgress} className="h-3 rounded-full" />
            </div>

            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
              Do not close this window
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const StepIndicator = () => (
    <div className="mb-8 md:mb-12">
      <div className="flex items-center justify-between gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div className={`flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
              step === s ? "border-primary bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" :
              step > s ? "border-primary bg-primary text-primary-foreground" :
              "border-border bg-card text-muted-foreground"
            }`}>
              {step > s ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : <span className="text-xs md:text-sm font-bold">{s}</span>}
            </div>
            {s < 5 && (
              <div className={`mx-1 md:mx-2 h-0.5 w-full rounded-full transition-all ${step > s ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 hidden md:flex justify-between px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <span>{t("createListing.stepBasics") || "BASICS"}</span>
        <span>{t("createListing.stepLocation") || "LOCATION"}</span>
        <span>{t("createListing.stepFeatures") || "FEATURES"}</span>
        <span>{t("createListing.stepConfig") || "CONFIG"}</span>
        <span>{t("createListing.stepMedia") || "MEDIA"}</span>
      </div>
      {/* Mobile Current Step Label */}
      <div className="mt-4 md:hidden text-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
          {t("createListing.step", { step, total: totalSteps }) || `Step ${step}`}: {
            step === 1 ? (t("createListing.stepBasics") || "Basics") :
            step === 2 ? (t("createListing.stepLocation") || "Location") :
            step === 3 ? (t("createListing.stepFeatures") || "Features") :
            step === 4 ? (listingType === "TRAVEL_PACKAGE" ? (t("createListing.itinerary") || "Itinerary") : (t("createListing.beds") || "Beds")) :
            (t("createListing.stepMedia") || "Media")
          }
        </span>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <UploadProgressOverlay />
      <div className="max-w-3xl mx-auto pb-20" dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-heading">
              {isEditMode ? t("createListing.edit") : t("createListing.add")} {{
                PROPERTY: t("common.property"),
                HOTEL_ROOM: t("common.hotelRoom"),
                HOSTEL_BED: t("common.hostel"),
                TRAVEL_PACKAGE: t("common.travelPackage"),
              }[listingType] || listingType}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {t("createListing.step", { step, total: totalSteps })}: {
                step === 1 ? t("createListing.step1Name") :
                step === 2 ? t("createListing.step2Name") :
                step === 3 ? t("createListing.step3Name") :
                step === 4 ? (listingType === "TRAVEL_PACKAGE" ? t("createListing.step4NamePackage") : t("createListing.step4NameProperty")) :
                t("createListing.stepName5")
              }
            </p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10 w-fit">
             <div className="text-[10px] font-bold text-primary uppercase tracking-tighter">{t("createListing.providerType")}</div>
             <div className="text-sm font-bold">{user.role}</div>
          </div>
        </div>

        <StepIndicator />

        {user.verification_status !== "VERIFIED" && (
          <div className="mb-8 p-4 rounded-3xl border border-orange-200 bg-orange-50 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="p-2 rounded-xl bg-orange-500 text-white shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-orange-900 leading-tight">{t("createListing.unverifiedTitle")}</h4>
              <p className="text-sm text-orange-800 mt-1">
                {t("createListing.unverifiedDesc", { 
                  status: user.verification_status === "PENDING" ? t("createListing.statusProcessing") : t("createListing.statusUnverified") 
                })}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* STEP 1: BASICS */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="rounded-3xl border bg-card p-5 md:p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Info className="h-5 w-5" /></div>
                  <h3 className="text-lg font-bold">{t("createListing.genInfo")}</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">{t("createListing.title")}</Label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t("createListing.titlePlaceholder")}
                      className="mt-2.5 w-full rounded-2xl border bg-background px-5 py-4 text-base focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-base font-semibold">{t("createListing.description")}</Label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("createListing.descPlaceholderDefault")}
                      rows={6}
                      className="mt-2.5 w-full resize-none rounded-2xl border bg-background px-5 py-4 text-base focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-base font-semibold">{t("createListing.price")} (DA)</Label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="mt-2.5 w-full rounded-2xl border bg-background px-5 py-4 text-base focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                        required
                      />
                    </div>
                    <div className="flex flex-col justify-end pb-3">
                      <div className="flex items-center gap-3 p-4 rounded-2xl border bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setNegotiable(!negotiable)}>
                        <input type="checkbox" checked={negotiable} readOnly className="h-5 w-5 rounded border-primary text-primary transition-all" />
                        <span className="font-medium">{t("createListing.negotiable")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION & CORE SPECS */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="rounded-3xl border bg-card p-5 md:p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500"><MapPin className="h-5 w-5" /></div>
                  <h3 className="text-lg font-bold">{t("createListing.locCapacity")}</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-base font-semibold">{t("filters.location") || "Wilaya"}</Label>
                      <Select value={selectedWilaya} onValueChange={(val) => {
                        setSelectedWilaya(val);
                        setSelectedCommune(""); // Reset commune when wilaya changes
                      }}>
                        <SelectTrigger className="mt-2.5 rounded-2xl h-14 bg-background px-5">
                          <SelectValue placeholder="Select Wilaya" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {wilayas.map(w => (
                            <SelectItem key={w.code} value={w.nameAscii}>{w.nameAscii}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-base font-semibold">Commune</Label>
                      <Select 
                        value={selectedCommune} 
                        onValueChange={setSelectedCommune}
                        disabled={!selectedWilaya}
                      >
                        <SelectTrigger className="mt-2.5 rounded-2xl h-14 bg-background px-5">
                          <SelectValue placeholder={selectedWilaya ? "Select Commune" : "Select Wilaya first"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {selectedWilaya && getCommunes(wilayas.find(w => w.nameAscii === selectedWilaya)?.code || "")
                            .map(c => (
                              <SelectItem key={c.nameAscii} value={c.nameAscii}>{c.nameAscii}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold">{t("createListing.location") || "Address Details"}</Label>
                    <input
                      type="text"
                      value={locationText}
                      onChange={(e) => setLocationText(e.target.value)}
                      placeholder={t("createListing.locationPlaceholder")}
                      className="mt-2.5 w-full rounded-2xl border bg-background px-5 py-4 text-base focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label className="text-base font-semibold">{t("createListing.mapPickerTitle")}</Label>
                    <div className="mt-3">
                      <MapLocationPicker
                        lat={lat}
                        lng={lng}
                        onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t("createListing.selectedCoords")}: {lat.toFixed(5)}, {lng.toFixed(5)}
                    </p>
                  </div>

                  <div className="pt-4 border-t space-y-6">
                    {/* TYPE SPECIFIC */}
                    {listingType === "PROPERTY" && (
                      <div className="space-y-6">
                        <div>
                          <Label className="text-base font-semibold">{t("createListing.propertyType")}</Label>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {propertyTypes.map((pt) => (
                              <button key={pt} type="button" onClick={() => setPropertyType(pt)} className={`px-4 py-2 rounded-full border text-sm font-bold transition-all ${propertyType === pt ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}>
                                {t(`types.${pt.toLowerCase()}` as any) || pt}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div><Label className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground pl-1">{t("createListing.bedrooms")}</Label><input type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)} className="mt-1 w-full rounded-xl border bg-background px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" /></div>
                          <div><Label className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground pl-1">{t("createListing.bathrooms")}</Label><input type="number" value={bathrooms} onChange={e => setBathrooms(e.target.value)} className="mt-1 w-full rounded-xl border bg-background px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" /></div>
                          <div><Label className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground pl-1">{t("createListing.maxGuests")}</Label><input type="number" value={maxGuests} onChange={e => setMaxGuests(e.target.value)} className="mt-1 w-full rounded-xl border bg-background px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" /></div>
                          <div><Label className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground pl-1">{t("createListing.minDuration")}</Label><input type="number" value={minDuration} onChange={e => setMinDuration(e.target.value)} className="mt-1 w-full rounded-xl border bg-background px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" /></div>
                        </div>
                      </div>
                    )}

                    {listingType === "HOTEL_ROOM" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-base font-semibold">{t("createListing.roomCategory")}</Label>
                          <Select value={roomCategory} onValueChange={setRoomCategory}>
                            <SelectTrigger className="mt-2 rounded-xl h-12 bg-background"><SelectValue /></SelectTrigger>
                            <SelectContent>{roomCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><Label className="text-[10px] uppercase font-bold text-muted-foreground">{t("createListing.quantity")}</Label><input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-3 text-sm focus:ring-1 focus:ring-primary outline-none" /></div>
                          <div><Label className="text-[10px] uppercase font-bold text-muted-foreground">{t("createListing.maxGuests")}</Label><input type="number" value={maxGuests} onChange={e => setMaxGuests(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-3 text-sm focus:ring-1 focus:ring-primary outline-none" /></div>
                        </div>
                      </div>
                    )}

                    {listingType === "HOSTEL_BED" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div>
                          <Label className="text-base font-semibold">{t("listingDetails.dormitory") || "Room Type"}</Label>
                          <RadioGroup value={hostelRoomType} onValueChange={setHostelRoomType} className="flex gap-4 mt-3">
                            <div className="flex items-center gap-2"><RadioGroupItem value="DORM" id="r-dorm" /><Label htmlFor="r-dorm">{t("listingDetails.dormitory")}</Label></div>
                            <div className="flex items-center gap-2"><RadioGroupItem value="PRIVATE" id="r-priv" /><Label htmlFor="r-priv">{t("listingDetails.privateRoom")}</Label></div>
                          </RadioGroup>
                        </div>
                        <div>
                          <Label className="text-base font-semibold">{t("createListing.genderRule") || "Gender Rule"}</Label>
                          <Select value={genderRestriction} onValueChange={setGenderRestriction}>
                            <SelectTrigger className="mt-2 rounded-xl h-12 bg-background"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MALE">{t("createListing.maleOnly")}</SelectItem>
                              <SelectItem value="FEMALE">{t("createListing.femaleOnly")}</SelectItem>
                              <SelectItem value="MIXED">{t("createListing.mixed")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {listingType === "TRAVEL_PACKAGE" && (
                      <div className="space-y-6">
                        <div>
                          <Label className="text-base font-semibold">Package Type</Label>
                          <div className="mt-3 flex flex-wrap gap-2">
                             {packageTypes.map(pt => (
                               <button key={pt} type="button" onClick={() => setPackageType(pt)} className={`px-4 py-2 rounded-full border text-sm font-bold transition-all ${packageType === pt ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}>
                                 {pt}
                               </button>
                             ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-base font-semibold">{t("createListing.pricingLogic")}</Label>
                          <p className="text-xs text-muted-foreground">{t("createListing.pricingLogicDesc", { price })}</p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FEATURES (AMENITIES, RESTRICTIONS, NEARBY) */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="rounded-3xl border bg-card p-5 md:p-8 shadow-sm">
                
                {listingType === "TRAVEL_PACKAGE" ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <ListChecks className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold">{t("createListing.featuresNotNeeded") || "Features Not Required"}</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                      {t("createListing.featuresNotNeededDesc") || "Travel packages do not require configuring property amenities or bed restrictions. Please click 'Next' to continue to the Itinerary & Schedules configuration."}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500"><ListChecks className="h-5 w-5" /></div>
                      <h3 className="text-lg font-bold">{t("createListing.featuresRules")}</h3>
                    </div>

                    <div className="space-y-8">
                      {/* Amenities */}
                  <div>
                    <Label className="text-base font-semibold flex items-center justify-between">
                      {t("createListing.availableAmenities")}
                      <span className="text-xs font-normal text-muted-foreground">{selectedAmenities.length} {t("createListing.selected")}</span>
                    </Label>
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {apiAmenities.map((amenity) => (
                        <div 
                          key={amenity.id}
                          onClick={() => toggleMetadata(amenity.id, "amenities")}
                          className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                            selectedAmenities.includes(amenity.id) ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-muted/10 hover:border-muted-foreground/30"
                          }`}
                        >
                          <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-background border">
                             {amenity.icon ? <img src={amenity.icon} className="h-4 w-4 opacity-70" alt="" /> : <Check className="h-4 w-4 opacity-20" />}
                          </div>
                          <span className="text-sm font-medium truncate">{getTranslatedName(amenity, language)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Restrictions */}
                  <div className="pt-6 border-t">
                    <Label className="text-base font-semibold">{t("createListing.restrictions")}</Label>
                     <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {apiRestrictions.map(r => (
                         <div 
                           key={r.id} 
                           onClick={() => toggleMetadata(r.id, "restrictions")}
                           className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                             selectedRestrictions.includes(r.id) ? "bg-red-500/10 text-red-600 border-red-500/40 ring-1 ring-red-500/20" : "bg-card hover:border-muted-foreground/30"
                           }`}
                         >
                           <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-background border">
                             {r.icon ? <img src={r.icon} className="h-4 w-4 opacity-70" alt="" /> : <AlertTriangle className="h-4 w-4 opacity-20" />}
                           </div>
                           <span className="text-sm font-medium truncate">{getTranslatedName(r, language)}</span>
                         </div>
                       ))}
                     </div>
                  </div>

                  {/* Nearby */}
                  <div className="pt-6 border-t">
                    <Label className="text-base font-semibold">{t("createListing.nearbyPlaces")}</Label>
                     <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                       {apiNearby.map(n => (
                         <div 
                           key={n.id} 
                           onClick={() => toggleMetadata(n.id, "nearby")}
                           className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                             selectedNearby.includes(n.id) ? "border-teal-500 bg-teal-500/5 ring-1 ring-teal-500/30 text-teal-700" : "bg-card hover:border-muted-foreground/30"
                           }`}
                         >
                           <div className="h-4 w-4 rounded-full border border-current flex items-center justify-center shrink-0">
                             {selectedNearby.includes(n.id) && <Check className="h-2 w-2" />}
                           </div>
                           <span className="text-sm font-medium truncate">{getTranslatedName(n, language)}</span>
                         </div>
                       ))}
                     </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: CONFIG (BEDS OR ITINERARY) */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="rounded-3xl border bg-card p-5 md:p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
                    {listingType === "TRAVEL_PACKAGE" ? <CalendarDays className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
                  </div>
                  <h3 className="text-lg font-bold">
                    {listingType === "TRAVEL_PACKAGE" ? t("createListing.itinerarySchedule") : t("createListing.bedroomConfigs")}
                  </h3>
                </div>

                {/* PACKAGE ITINERARY */}
                {listingType === "TRAVEL_PACKAGE" ? (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      {itinerary.map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex flex-col items-center pt-2">
                             <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs ring-4 ring-primary/10">
                               {item.day}
                             </div>
                             {idx < itinerary.length - 1 && <div className="w-0.5 grow bg-border my-2" />}
                          </div>
                          <div className="grow rounded-2xl border bg-muted/10 p-4 space-y-3">
                            <input 
                              type="text" 
                              value={item.title} 
                              readOnly={idx === 0 || idx === itinerary.length - 1}
                              onChange={e => updateItinerary(idx, "title", e.target.value)}
                              placeholder={t("createListing.dayPlaceholder")}
                              className="w-full bg-transparent font-bold text-lg outline-none border-b border-transparent focus:border-primary pb-1 read-only:opacity-60"
                            />
                            <textarea 
                              value={item.description} 
                              onChange={e => updateItinerary(idx, "description", e.target.value)}
                              placeholder={t("createListing.dayDescPlaceholder", { day: item.day })}
                              rows={2}
                              className="w-full bg-transparent text-sm resize-none outline-none text-muted-foreground"
                            />
                            {idx !== 0 && idx !== itinerary.length - 1 && (
                              <button type="button" onClick={() => removeDay(idx)} className="text-destructive text-xs font-bold flex items-center gap-1 hover:underline">
                                <Trash2 className="h-3 w-3" /> {t("createListing.removeDay")}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={addDay} className="w-full rounded-2xl border-dashed h-12 gap-2">
                        <Plus className="h-4 w-4" /> {t("createListing.addDayToItinerary")}
                      </Button>
                    </div>

                    {/* PACKAGE SCHEDULES (MANAGEMENT) */}
                    <div className="pt-8 border-t space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">{t("createListing.schedules")}</Label>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={addSchedule}
                          className="text-primary hover:text-primary hover:bg-primary/10 gap-2 font-bold"
                        >
                          <Plus className="h-4 w-4" /> {t("createListing.addSchedule")}
                        </Button>
                      </div>

                      <div className="grid gap-4">
                        {schedules.map((s, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border bg-muted/5 transition-all hover:border-primary/20">
                            <div className="grow grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground mb-1 block pl-1">
                                  {t("createListing.startDate")}
                                </Label>
                                <input 
                                  type="date" 
                                  value={s.start_date}
                                  onChange={e => updateSchedule(idx, "start_date", e.target.value)}
                                  className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                                  required
                                />
                              </div>
                              <div>
                                <Label className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground mb-1 block pl-1">
                                  {t("createListing.maxCapacity")}
                                </Label>
                                <input 
                                  type="number" 
                                  value={s.max_capacity}
                                  onChange={e => updateSchedule(idx, "max_capacity", parseInt(e.target.value) || 0)}
                                  className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                                  min="1"
                                  required
                                />
                              </div>
                            </div>
                            {schedules.length > 1 && (
                              <div className="flex items-end justify-end sm:pb-1">
                                <button 
                                  type="button" 
                                  onClick={() => removeSchedule(idx)}
                                  className="p-2.5 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* BED CONFIGURATION */
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                       {apiBedTypes.filter(bt => !bedsConfig.find(bc => bc.bed_type_id === bt.id)).map(bt => (
                         <button key={bt.id} type="button" onClick={() => addBedType(bt.id)} className="flex items-center gap-2 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors text-sm font-medium">
                           <Plus className="h-4 w-4" /> {getTranslatedName(bt, language)}
                         </button>
                       ))}
                    </div>

                    {bedsConfig.length > 0 ? (
                      <div className="space-y-3 pt-6 border-t">
                        {bedsConfig.map(bc => {
                          const details = apiBedTypes.find(bt => bt.id === bc.bed_type_id);
                          return (
                            <div key={bc.bed_type_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border bg-background gap-4">
                              <span className="font-bold flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                                   <Settings className="h-4 w-4 text-muted-foreground" />
                                </div>
                                {getTranslatedName(details, language)}
                              </span>
                              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                                <div className="flex items-center border rounded-xl overflow-hidden bg-muted/20">
                                  <button type="button" onClick={() => updateBedQuantity(bc.bed_type_id, bc.quantity - 1)} className="px-4 py-2 hover:bg-muted font-bold text-lg">-</button>
                                  <div className="w-10 text-center font-bold">{bc.quantity}</div>
                                  <button type="button" onClick={() => updateBedQuantity(bc.bed_type_id, bc.quantity + 1)} className="px-4 py-2 hover:bg-muted font-bold text-lg">+</button>
                                </div>
                                <button type="button" onClick={() => removeBed(bc.bed_type_id)} className="text-destructive p-3 hover:bg-destructive/10 rounded-xl transition-colors"><Trash2 className="h-5 w-5" /></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-10 border-2 border-dashed rounded-3xl text-center text-muted-foreground">
                        {t("createListing.noBedsSelected")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: MEDIA */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="rounded-3xl border bg-card p-5 md:p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500"><ImageIcon className="h-5 w-5" /></div>
                  <h3 className="text-lg font-bold">{t("createListing.media")}</h3>
                </div>

                <div className="space-y-8">
                  {/* Cover Image */}
                  <div>
                    <Label className="text-base font-semibold">{t("createListing.coverImage")}</Label>
                    <div 
                      onClick={() => coverInputRef.current?.click()}
                      className={`mt-3 relative h-64 w-full rounded-2xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all ${
                        coverPreview ? "border-primary" : "border-border hover:border-primary/50 bg-muted/20"
                      }`}
                    >
                      {coverPreview ? (
                        <img src={coverPreview} className="h-full w-full object-cover" alt="Preview" />
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <span className="text-sm font-medium text-muted-foreground">{t("createListing.uploadCover")}</span>
                        </>
                      )}
                      <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverChange} />
                    </div>
                  </div>

                  {/* Gallery */}
                  <div className="pt-6 border-t">
                    <Label className="text-base font-semibold">{t("createListing.gallery")} {t("createListing.imagesHint")}</Label>
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                       {galleryPreviews.map((p, idx) => (
                         <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border">
                           <img src={p} className="h-full w-full object-cover" alt="" />
                           <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Trash2 className="h-3 w-3" />
                           </button>
                         </div>
                       ))}
                       <button 
                         type="button" 
                         onClick={() => galleryInputRef.current?.click()}
                         className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors"
                        >
                         <Plus className="h-6 w-6 text-muted-foreground" />
                         <span className="text-[10px] font-bold uppercase text-muted-foreground">{t("createListing.addPhoto")}</span>
                       </button>
                    </div>
                    <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={handleGalleryChange} />
                  </div>

                  <div className="pt-8 border-t">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <h4 className="font-bold flex items-center gap-2 text-primary mb-1"><Check className="h-4 w-4" /> {t("createListing.readyToPublish")}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t("createListing.publishNote")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 pb-12">
             {step > 1 ? (
               <Button type="button" variant="outline" size="lg" className="rounded-2xl gap-2 px-8 order-2 sm:order-1" onClick={() => { setStep(step - 1); window.scrollTo(0, 0); }}>
                 <ChevronLeft className="h-5 w-5" /> {t("common.previous")}
               </Button>
             ) : <div className="hidden sm:block order-1" />}

             <Button type="submit" size="lg" className="rounded-2xl gap-2 min-w-full sm:min-w-[200px] order-1 sm:order-2" disabled={submitting}>
               {submitting ? (
                 <> <Loader2 className="h-5 w-5 animate-spin" /> {isEditMode ? t("createListing.saving") : t("createListing.publishing")} </>
               ) : (
                 <>
                   {step < totalSteps ? t("createListing.saveContinue") : (isEditMode ? t("createListing.update") : t("createListing.publish"))} 
                   {step < totalSteps && <ChevronRight className="h-5 w-5" />}
                 </>
               )}
             </Button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateListing;
