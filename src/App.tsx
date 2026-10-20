import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import MapPage from "./pages/MapPage";
import FactionsPage from "./pages/FactionsPage";
import MatchesFeedPage from "./pages/MatchesFeedPage";
import MatchDetailPage from "./pages/MatchDetailPage";
import ReportMatchPage from "./pages/ReportMatchPage";
import ForumThreadsPage from "./pages/ForumThreadsPage";
import ForumThreadPage from "./pages/ForumThreadPage";
import LeaderboardPage from "./pages/LeaderboardPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/" element={<MapPage />} />
          <Route
            path="/factions"
            element={
              <ProtectedRoute>
                <FactionsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/matches" element={<MatchesFeedPage />} />
          <Route path="/matches/:matchId" element={<MatchDetailPage />} />
          <Route
            path="/matches/new"
            element={
              <ProtectedRoute>
                <ReportMatchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/:factionId"
            element={
              <ProtectedRoute>
                <ForumThreadsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/:factionId/:threadId"
            element={
              <ProtectedRoute>
                <ForumThreadPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
