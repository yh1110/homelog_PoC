import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import { useAuth } from "./contexts/UseAuth";

// 認証＋利用規約同意が必要なルート
function TermsProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, userProfile, profileLoading } = useAuth();

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // 利用規約未同意の場合は利用規約ページへ
  if (userProfile && !userProfile.terms_accepted) {
    return (
      <>
        {children}
        <Terms />
      </>
    );
  }

  return <>{children}</>;
}

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={
            <TermsProtectedRoute>
              <Index />
            </TermsProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
