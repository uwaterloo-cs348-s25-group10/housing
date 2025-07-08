import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import HousingTrendsPage from "./pages/HousingTrendsPage";
import IncomeTrendsPage from "./pages/IncomeTrendsPage";
import WhereCanLivePage from "./pages/WhereCanLivePage";
import ReverseLookupPage from "./pages/ReverseLookupPage";
import AffordabilityRankingPage from "./pages/AffordabilityRankingPage";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/housing" element={<HousingTrendsPage />} />
        <Route path="/income" element={<IncomeTrendsPage />} />
        <Route path="/quiz" element={<WhereCanLivePage />} />
        <Route path="/reverse-lookup" element={<ReverseLookupPage />} />
        <Route path="/ranking" element={<AffordabilityRankingPage />} />
        {/* Add more routes like /quiz or /ranking later */}
      </Routes>
    </div>
  );
}

export default App;
