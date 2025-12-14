import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// Pages
import HomePage from "./pages/home/HomePage";
import PropertiesPage from "./pages/properties/PropertiesPage";
import PropertyDetailPage from "./pages/property/PropertyDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AboutPage from "./pages/cms/AboutPage";
import BlogPage from "./pages/cms/BlogPage";
import BlogPostPage from "./pages/cms/BlogPostPage";
import PrivacyPage from "./pages/cms/PrivacyPage";
import TermsPage from "./pages/cms/TermsPage";
import CustomToaster from "./components/toaster/CustomToaster";

// Buyer pages
import BuyerSidebar from "./pages/buyer/BuyerSidebar";
import BuyerDashboard from "./pages/buyer/BuyerDashboard";
import BuyerWishlist from "./pages/buyer/BuyerWishlist";
import BuyerMessages from "./pages/buyer/BuyerMessages";

// Seller pages
import SellerSidebar from "./pages/seller/SellerSidebar";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerListings from "./pages/seller/SellerListings";
import AddProperty from "./pages/seller/AddProperty";
import EditProperty from "./pages/seller/EditProperty";
import PropertyView from "./pages/seller/PropertyView";
import AdminChat from "./components/AdminChat";
import SellerChat from "./components/SellerChat";
import SellerMessages from "./pages/seller/SellerMessages";
import BuyerProfile from "./pages/buyer/BuyerProfile";
import SellerProfile from "./pages/seller/SellerProfile";

// Protected route components
const BuyerRoute = ({ children }) => {
  const { isLoggedIn, isBuyer } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  if (!isBuyer) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 pt-16">
        <BuyerSidebar />
        <main className="flex-1 ">
          <div className="p-4 sm:p-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const SellerRoute = ({ children }) => {
  const { isLoggedIn, isSeller } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  if (!isSeller) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen pt-16">
      <SellerSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
};

function App() {
  return (
    <>
      <Navbar />
      <CustomToaster />
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/property/:id" element={<PropertyDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Buyer Routes */}
        <Route
          path="/buyer/dashboard"
          element={
            <BuyerRoute>
              <BuyerDashboard />
            </BuyerRoute>
          }
        />
        <Route
          path="/buyer/wishlist"
          element={
            <BuyerRoute>
              <BuyerWishlist />
            </BuyerRoute>
          }
        />
        <Route
          path="/buyer/messages"
          element={
            <BuyerRoute>
              <BuyerMessages />
            </BuyerRoute>
          }
        />
        <Route
          path="/buyer/profile"
          element={
            <BuyerRoute>
              <BuyerProfile />
            </BuyerRoute>
          }
        />

        {/* Seller Routes */}
        <Route
          path="/seller/dashboard"
          element={
            <SellerRoute>
              <SellerDashboard />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/listings"
          element={
            <SellerRoute>
              <SellerListings />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/add-property"
          element={
            <SellerRoute>
              <AddProperty />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/edit-property/:id"
          element={
            <SellerRoute>
              <EditProperty />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/property/:id"
          element={
            <SellerRoute>
              <PropertyView />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/profile"
          element={
            <SellerRoute>
             <SellerProfile />  
            </SellerRoute>
          }
        />
        <Route
          path="/seller/messages"
          element={
            <SellerRoute>
              <SellerMessages />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/chat"
          element={
            <SellerRoute>
              <SellerChat />
            </SellerRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;