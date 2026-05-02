import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Veterinaires from "./pages/Veterinaires.tsx";
import NouveauRdv from "./pages/NouveauRdv.tsx";
import Animaux from "./pages/Animaux.tsx";
import AnimalForm from "./pages/AnimalForm.tsx";
import AnimalProfile from "./pages/AnimalProfile.tsx";
import Payment from "./pages/Payment.tsx";
import Contact from "./pages/Contact.tsx";
import NotFound from "./pages/NotFound.tsx";
import "./i18n/i18n";

const queryClient = new QueryClient();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/veterinaires" element={<ProtectedRoute><Veterinaires /></ProtectedRoute>} />
            <Route path="/nouveau-rdv" element={<ProtectedRoute><NouveauRdv /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/animaux" element={<ProtectedRoute><Animaux /></ProtectedRoute>} />
            <Route path="/animaux/nouveau" element={<ProtectedRoute><AnimalForm /></ProtectedRoute>} />
            <Route path="/animaux/:id" element={<ProtectedRoute><AnimalProfile /></ProtectedRoute>} />
            <Route path="/animaux/:id/edit" element={<ProtectedRoute><AnimalForm /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
