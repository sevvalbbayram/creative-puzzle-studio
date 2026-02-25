import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Results from "./pages/Results";
import Leaderboard from "./pages/Leaderboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherLogin from "./pages/TeacherLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/lobby/:sessionId" element={<Lobby />} />
          <Route path="/game/:sessionId" element={<Game />} />
          <Route path="/results/:sessionId" element={<Results />} />
          <Route path="/dashboard/:sessionId" element={<TeacherDashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
