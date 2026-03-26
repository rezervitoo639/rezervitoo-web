import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useLanguage } from "./i18n/LanguageContext";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Listings from "./pages/Listings.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import ListingDetails from "./pages/ListingDetails.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import MyListings from "./pages/MyListings.tsx";
import MyBookings from "./pages/MyBookings.tsx";
import CreateListing from "./pages/CreateListing.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProviderProfile from "./pages/ProviderProfile.tsx";
import Wishlist from "./pages/Wishlist.tsx";
import UserBookings from "./pages/UserBookings.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import Services from "./pages/Services.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import ProviderPublicProfile from "./pages/ProviderPublicProfile.tsx";
import AuthGuard from "./components/AuthGuard.tsx";
import UserProfile from "./pages/UserProfile.tsx";
import VerifyEmail from "./pages/VerifyEmail.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Notifications from "./pages/Notifications.tsx";

import { ThemeProvider } from "./components/ThemeProvider";

const queryClient = new QueryClient();

const TitleUpdater = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    const path = location.pathname;
    let titleKey = "nav.home";
    
    if (path.startsWith("/listings") || path.startsWith("/listing/")) titleKey = "nav.listings";
    else if (path.startsWith("/login")) titleKey = "nav.login";
    else if (path.startsWith("/register")) titleKey = "nav.register";
    else if (path.startsWith("/dashboard")) titleKey = "nav.dashboard";
    else if (path.startsWith("/about")) titleKey = "nav.about";
    else if (path.startsWith("/contact")) titleKey = "nav.contact";
    else if (path.startsWith("/services")) titleKey = "nav.services";
    else if (path.startsWith("/privacy")) titleKey = "footer.privacy";
    else if (path.startsWith("/terms")) titleKey = "footer.terms";
    else if (path.startsWith("/my-bookings") || path.startsWith("/bookings")) titleKey = "nav.myBookings";
    else if (path.startsWith("/notifications")) titleKey = "nav.notifications";
    else if (path.startsWith("/wishlist")) titleKey = "nav.wishlist";
    else if (path.startsWith("/profile") || path.startsWith("/provider/")) titleKey = "nav.profile";

    document.title = `RezerVitoo | ${t(titleKey)}`;
  }, [location, t]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="rezervitoo-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TitleUpdater />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listing/:id" element={<ListingDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/provider/:id" element={<ProviderPublicProfile />} />
            
            {/* Provider Routes */}
            <Route path="/dashboard" element={<AuthGuard allowedAccountType="PROVIDER"><Dashboard /></AuthGuard>} />
            <Route path="/dashboard/listings" element={<AuthGuard allowedAccountType="PROVIDER"><MyListings /></AuthGuard>} />
            <Route path="/dashboard/bookings" element={<AuthGuard allowedAccountType="PROVIDER"><MyBookings /></AuthGuard>} />
            <Route path="/dashboard/create" element={<AuthGuard allowedAccountType="PROVIDER"><CreateListing /></AuthGuard>} />
            <Route path="/dashboard/edit/:id" element={<AuthGuard allowedAccountType="PROVIDER"><CreateListing /></AuthGuard>} />
            <Route path="/dashboard/profile" element={<AuthGuard allowedAccountType="PROVIDER"><ProviderProfile /></AuthGuard>} />
            
            {/* User Routes */}
            <Route path="/wishlist" element={<AuthGuard allowedAccountType="USER"><Wishlist /></AuthGuard>} />
            <Route path="/my-bookings" element={<AuthGuard allowedAccountType="USER"><UserBookings /></AuthGuard>} />
            <Route path="/bookings" element={<Navigate to="/my-bookings" replace />} />
            <Route path="/profile" element={<AuthGuard allowedAccountType="USER"><UserProfile /></AuthGuard>} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/password-reset" element={<ResetPassword />} />
            <Route path="/notifications" element={<AuthGuard><Notifications /></AuthGuard>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
