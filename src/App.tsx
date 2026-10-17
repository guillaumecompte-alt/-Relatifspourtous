import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Addition from "./pages/Addition";
import Subtraction from "./pages/Subtraction";
import MixedAddSub from "./pages/MixedAddSub";
import Multiplication from "./pages/Multiplication";
import Division from "./pages/Division";
import MixedMulDiv from "./pages/MixedMulDiv";
import FinalExam from "./pages/FinalExam";
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
          <Route path="/addition" element={<Addition />} />
          <Route path="/subtraction" element={<Subtraction />} />
          <Route path="/mixed-add-sub" element={<MixedAddSub />} />
          <Route path="/multiplication" element={<Multiplication />} />
          <Route path="/division" element={<Division />} />
          <Route path="/mixed-mul-div" element={<MixedMulDiv />} />
          <Route path="/final-exam" element={<FinalExam />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
